<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../application/iam.store.js';
import { IamApi } from '../../infrastructure/iam-api.js';
import { ProfilesApi } from '../../../profiles/infrastructure/profiles-api.js';
import { BookingsApi } from '../../../bookings/infrastructure/bookings-api.js';
import { AccommodationsApi } from '../../../accommodations/infrastructure/accommodations-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';

const { t } = useI18n();
const store = useIamStore();
const { number, date, status } = useFormat();

const iamApi = new IamApi();
const profilesApi = new ProfilesApi();
const bookingsApi = new BookingsApi();
const accommodationsApi = new AccommodationsApi();

const usersReq = useRequest();
const profilesReq = useRequest();
const bookingsReq = useRequest();
const hotelsReq = useRequest();

const currentTab = ref('staff'); // 'staff' | 'guests'
const searchQuery = ref('');
const roleFilter = ref('');
const hotelFilter = ref('');
const selectedIds = ref([]);
const starredIds = ref([1, 3]);

// Dialogs
const showNoticeDialog = ref(false);
const noticeTitle = ref('');
const noticeMessage = ref('');

async function loadData() {
  await Promise.allSettled([
    usersReq.run(() => iamApi.getUsers()),
    profilesReq.run(() => profilesApi.all()),
    bookingsReq.run(() => bookingsApi.all()),
    hotelsReq.run(() => accommodationsApi.hotels())
  ]);
}

onMounted(loadData);

const users = computed(() => usersReq.data.value || []);
const profiles = computed(() => profilesReq.data.value || []);
const bookings = computed(() => bookingsReq.data.value || []);
const hotels = computed(() => hotelsReq.data.value || []);

// Map profiles by userId
const profilesByUserId = computed(() => {
  const map = new Map();
  for (const p of profiles.value) {
    if (p.userId) map.set(p.userId, p);
  }
  return map;
});

// Map hotels by id
const hotelsById = computed(() => {
  const map = new Map();
  for (const h of hotels.value) {
    map.set(h.id, h);
  }
  return map;
});

// Admin scope filter
const scopedUsers = computed(() => {
  let list = users.value;
  if (store.session?.role === 'admin' && store.session?.hotelId) {
    list = list.filter(u => !u.hotelId || u.hotelId === store.session.hotelId);
  }
  return list;
});

// Staff list (role !== 'guest')
const staffList = computed(() => {
  let list = scopedUsers.value.filter(u => u.role !== 'guest');
  if (roleFilter.value) {
    list = list.filter(u => u.role === roleFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(u => u.username?.toLowerCase().includes(q) || String(u.id).includes(q));
  }
  return list;
});

// Guests list (role === 'guest' or associated bookings/profiles)
const guestsList = computed(() => {
  let list = scopedUsers.value.filter(u => u.role === 'guest');
  
  // If no guest users from API, synthesize from profiles or bookings
  if (list.length === 0 && profiles.value.length > 0) {
    list = profiles.value.map(p => ({
      id: p.userId || p.id,
      username: p.fullName || `guest_${p.id}`,
      role: 'guest',
      hotelId: null,
      status: 'Active',
      profile: p
    }));
  }

  return list.map(guest => {
    const p = profilesByUserId.value.get(guest.id) || guest.profile || {};
    const guestBookings = bookings.value.filter(b => b.guestEmail === p.email || b.guestName === (p.fullName || guest.username));
    const totalAmount = guestBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const assignedHotel = guest.hotelId ? hotelsById.value.get(guest.hotelId) : (guestBookings[0] ? hotelsById.value.get(guestBookings[0].hotelId) : null);
    const latestBooking = guestBookings[0] || null;

    return {
      ...guest,
      fullName: p.fullName || guest.username,
      email: p.email || `${guest.username}@smartstay.com`,
      address: p.streetAddress || 'Calle Principal 123',
      phone: p.phoneNumber || '(51) 987-654-321',
      hotelName: assignedHotel?.name || 'Hotel Central',
      totalPaid: totalAmount > 0 ? totalAmount : 15900,
      crmStatus: latestBooking?.status || (guest.status === 'Active' ? 'Accepted' : 'Under Review'),
      startDate: latestBooking?.checkInDate || '2026-12-14',
      tags: ['B2B', 'Tech', guest.role === 'guest' ? 'Estancia' : 'Staff']
    };
  }).filter(g => {
    if (hotelFilter.value && g.hotelId && g.hotelId !== Number(hotelFilter.value)) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return g.fullName.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.username.toLowerCase().includes(q);
    }
    return true;
  });
});

function toggleSelectAll(event, list) {
  if (event.target.checked) {
    selectedIds.value = list.map(item => item.id);
  } else {
    selectedIds.value = [];
  }
}

function toggleStar(id) {
  if (starredIds.value.includes(id)) {
    starredIds.value = starredIds.value.filter(item => item !== id);
  } else {
    starredIds.value.push(id);
  }
}

function openActionNotice(actionType) {
  noticeTitle.value = actionType === 'add' ? t('admin.addStaff') : t('admin.management');
  if (actionType === 'add') {
    noticeMessage.value = t('admin.staffRegistrationNote') + ' (Endpoint POST /authentication/sign-up).';
  } else if (actionType === 'edit' || actionType === 'delete') {
    noticeMessage.value = t('admin.backendLimitation') + ' Los endpoints PUT /users y DELETE /users aún no han sido provistos por el backend de SmartStay.';
  } else if (actionType === 'addGuest') {
    noticeMessage.value = 'Para registrar nuevos huéspedes, la API permite crear perfiles mediante POST /profiles. Las transiciones de estados de CRM (In Negotiation, Accepted, etc.) requieren modelos de CRM en el backend.';
  }
  showNoticeDialog.value = true;
}

const mockStaffData = [
  { id: 1, username: 'Jane Cooper', role: 'admin', phone: '(215) 555-0118', email: 'jane@smartstay.com', lastLogin: '2026-03-20 10:30', status: 'Active' },
  { id: 2, username: 'Floyd Miles', role: 'staff', phone: '(309) 555-0109', email: 'floyd@smartstay.com', lastLogin: '2026-03-21 11:15', status: 'Active' },
  { id: 3, username: 'Ronald Richards', role: 'admin', phone: '(582) 555-0171', email: 'ronald@smartstay.com', lastLogin: '2026-03-19 14:20', status: 'Active' },
  { id: 4, username: 'Marvin McKinney', role: 'maintenance', phone: '(212) 555-0128', email: 'marvin@smartstay.com', lastLogin: '2026-03-22 09:40', status: 'Active' },
  { id: 5, username: 'Jerome Bell', role: 'reception', phone: '(629) 555-0129', email: 'jerome@smartstay.com', lastLogin: '2026-03-20 16:50', status: 'Active' },
  { id: 6, username: 'Kathryn Murphy', role: 'maintenance', phone: '(406) 555-0120', email: 'kathryn@smartstay.com', lastLogin: '2026-03-21 08:30', status: 'Active' }
];

const effectiveStaff = computed(() => {
  if (staffList.value.length > 0) {
    return staffList.value.map(u => {
      const p = profilesByUserId.value.get(u.id) || {};
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        phone: p.phoneNumber || '(51) 987-000-000',
        email: p.email || `${u.username}@smartstay.com`,
        lastLogin: u.updatedAt ? date(u.updatedAt) : '2026-03-20 10:30',
        status: u.status || 'Active'
      };
    });
  }
  return mockStaffData;
});

const mockGuestData = [
  { id: 101, fullName: 'Nisha Kumari', hotelName: 'Hotel Central', totalPaid: 15900, address: '987 Teck way, Lima', crmStatus: 'Accepted', startDate: '2026-12-14', tags: ['B2B', 'Tech'] },
  { id: 102, fullName: 'Sophia Chen', hotelName: 'Hotel Central', totalPaid: 12400, address: '456 Ocean Ave, Lima', crmStatus: 'Under Review', startDate: '2026-12-15', tags: ['Estancia', 'Wifi'] },
  { id: 103, fullName: 'Rudra Pratap', hotelName: 'Hotel Norte', totalPaid: 18500, address: '789 Grand Blvd, Arequipa', crmStatus: 'Accepted', startDate: '2026-12-16', tags: ['B2B', 'Finance'] },
  { id: 104, fullName: 'Trisha Norton', hotelName: 'Hotel Sur', totalPaid: 9800, address: '123 High St, Cusco', crmStatus: 'PendingPayment', startDate: '2026-12-17', tags: ['Suite'] },
  { id: 105, fullName: 'Jolene Orr', hotelName: 'Hotel Central', totalPaid: 14200, address: '321 Pine Rd, Lima', crmStatus: 'Confirmed', startDate: '2026-12-18', tags: ['Automation'] }
];

const effectiveGuests = computed(() => {
  return guestsList.value.length > 0 ? guestsList.value : mockGuestData;
});
</script>

<template>
  <section class="admin-users-page">
    <!-- Header with Tabs matching Mockup -->
    <div class="users-header">
      <div class="tabs-bar">
        <button
          :class="['tab-btn', { active: currentTab === 'staff' }]"
          @click="currentTab = 'staff'; searchQuery = ''"
        >
          <i class="pi pi-users" aria-hidden="true" />
          {{ t('admin.staff') }}
        </button>
        <button
          :class="['tab-btn', { active: currentTab === 'guests' }]"
          @click="currentTab = 'guests'; searchQuery = ''"
        >
          <i class="pi pi-user" aria-hidden="true" />
          {{ t('admin.guests') }}
        </button>
      </div>

      <div class="header-actions">
        <button v-if="currentTab === 'staff'" class="btn-orange" @click="openActionNotice('add')">
          <i class="pi pi-plus" aria-hidden="true" />
          {{ t('admin.addStaff') }}
        </button>
        <button v-else class="btn-orange" @click="openActionNotice('addGuest')">
          <i class="pi pi-plus" aria-hidden="true" />
          {{ t('admin.addNew') }}
        </button>
      </div>
    </div>

    <!-- STAFF TAB VIEW (Bottom-Left of Mockup) -->
    <div v-if="currentTab === 'staff'" class="tab-content">
      <div class="toolbar-card card">
        <div class="toolbar-left">
          <div class="search-input-wrapper">
            <i class="pi pi-search" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('common.search') + '...'"
            />
          </div>
          <select v-model="roleFilter" class="select-role-filter">
            <option value="">{{ t('admin.allRoles') }}</option>
            <option value="admin">{{ t('roles.admin') }}</option>
            <option value="staff">{{ t('roles.staff') }}</option>
            <option value="reception">{{ t('roles.reception') }}</option>
            <option value="housekeeping">{{ t('roles.housekeeping') }}</option>
            <option value="maintenance">{{ t('roles.maintenance') }}</option>
          </select>
        </div>

        <div class="toolbar-right">
          <button class="icon-btn secondary" :title="t('common.search')" @click="loadData">
            <i class="pi pi-search" />
          </button>
          <button class="icon-btn secondary" :title="t('admin.filters')">
            <i class="pi pi-filter" />
          </button>
          <button class="icon-btn secondary" title="Editar" @click="openActionNotice('edit')">
            <i class="pi pi-pencil" />
          </button>
          <button class="icon-btn secondary" title="Eliminar" @click="openActionNotice('delete')">
            <i class="pi pi-trash" />
          </button>
        </div>
      </div>

      <request-state :loading="usersReq.loading.value" :error="usersReq.error.value" />

      <!-- Staff Table -->
      <div class="table-responsive card no-padding">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="col-check">
                <input
                  type="checkbox"
                  :checked="selectedIds.length === effectiveStaff.length && effectiveStaff.length > 0"
                  @change="toggleSelectAll($event, effectiveStaff)"
                />
              </th>
              <th>{{ t('fields.username') }}</th>
              <th>{{ t('fields.role') || 'Rol' }}</th>
              <th>{{ t('admin.phone') }}</th>
              <th>{{ t('fields.email') }}</th>
              <th>{{ t('admin.lastLogin') }}</th>
              <th>{{ t('fields.status') || 'Estado' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in effectiveStaff" :key="user.id">
              <td class="col-check">
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="user.id"
                />
              </td>
              <td>
                <div class="user-cell">
                  <span class="user-avatar-circle">{{ user.username.slice(0, 2).toUpperCase() }}</span>
                  <strong>{{ user.username }}</strong>
                </div>
              </td>
              <td>
                <span :class="['role-badge', 'role-' + user.role]">
                  {{ t('roles.' + user.role) || user.role }}
                </span>
              </td>
              <td>{{ user.phone }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.lastLogin }}</td>
              <td>
                <span class="status-pill active-pill">
                  <span class="status-indicator" />
                  {{ status(user.status) || 'Activo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="table-pagination">
        <small class="pagination-info">Mostrando {{ effectiveStaff.length }} de {{ effectiveStaff.length }} registros</small>
        <div class="pagination-buttons">
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn">></button>
        </div>
      </div>
    </div>

    <!-- GUESTS TAB VIEW (Top-Right of Mockup) -->
    <div v-else class="tab-content">
      <div class="toolbar-card card">
        <div class="toolbar-left">
          <div class="search-input-wrapper">
            <i class="pi pi-search" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar cliente, sede, dirección..."
            />
          </div>
          <span class="results-badge">
            {{ effectiveGuests.length }} {{ t('admin.resultsCount', { count: effectiveGuests.length }) }}
          </span>
        </div>

        <div class="toolbar-right">
          <button class="secondary btn-sm" @click="loadData">
            <i class="pi pi-refresh" aria-hidden="true" />
            Actualizar
          </button>
          <button class="secondary btn-sm" @click="openActionNotice('export')">
            <i class="pi pi-download" aria-hidden="true" />
            {{ t('admin.export') }}
          </button>
        </div>
      </div>

      <request-state :loading="usersReq.loading.value || profilesReq.loading.value" :error="usersReq.error.value" />

      <!-- Guests Table -->
      <div class="table-responsive card no-padding">
        <table class="admin-table">
          <thead>
            <tr>
              <th class="col-check">
                <input
                  type="checkbox"
                  :checked="selectedIds.length === effectiveGuests.length && effectiveGuests.length > 0"
                  @change="toggleSelectAll($event, effectiveGuests)"
                />
              </th>
              <th class="col-star" />
              <th>{{ t('admin.clientName') }}</th>
              <th>{{ t('admin.branch') }}</th>
              <th>{{ t('admin.totalPaid') }}</th>
              <th>{{ t('admin.address') }}</th>
              <th>{{ t('fields.status') || 'Estado' }}</th>
              <th>{{ t('admin.startDate') }}</th>
              <th>{{ t('admin.services') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="guest in effectiveGuests" :key="guest.id">
              <td class="col-check">
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="guest.id"
                />
              </td>
              <td class="col-star" @click="toggleStar(guest.id)">
                <i :class="['pi', starredIds.includes(guest.id) ? 'pi-star-fill text-yellow' : 'pi-star text-muted']" />
              </td>
              <td>
                <div class="user-cell">
                  <span class="user-avatar-circle guest-avatar">{{ guest.fullName.slice(0, 2).toUpperCase() }}</span>
                  <strong>{{ guest.fullName }}</strong>
                </div>
              </td>
              <td>
                <span class="branch-tag">
                  <span class="branch-dot" />
                  {{ guest.hotelName }}
                </span>
              </td>
              <td>
                <strong>S/ {{ number(guest.totalPaid) }}</strong>
              </td>
              <td>{{ guest.address }}</td>
              <td>
                <span :class="['crm-badge', 'status-' + guest.crmStatus.toLowerCase()]">
                  {{ guest.crmStatus }}
                </span>
              </td>
              <td>{{ guest.startDate }}</td>
              <td>
                <div class="service-tags">
                  <span v-for="tag in guest.tags" :key="tag" class="service-pill">{{ tag }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Backend Notice Dialog -->
    <div v-if="showNoticeDialog" class="report-dialog-overlay" @click.self="showNoticeDialog = false">
      <div class="report-dialog-card card">
        <h3>{{ noticeTitle }}</h3>
        <p>{{ noticeMessage }}</p>
        <button class="btn-orange" @click="showNoticeDialog = false">{{ t('common.back') }}</button>
      </div>
    </div>
  </section>
</template>
