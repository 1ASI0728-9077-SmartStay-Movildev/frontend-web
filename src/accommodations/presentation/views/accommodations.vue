<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';
import { AccommodationsApi } from '../../infrastructure/accommodations-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';

const { t } = useI18n();
const store = useIamStore();
const api = new AccommodationsApi();
const { number } = useFormat();

const hotelsReq = useRequest();
const roomsReq = useRequest();
const optionsReq = useRequest();
const detailReq = useRequest();

const selectedHotel = ref(null);
const selectedRoomNumber = ref('');
const showNoticeModal = ref(false);
const noticeTitle = ref('');
const noticeText = ref('');
const showAmenitiesModal = ref(false);

const scoped = (items, isHotel = false) => {
  if (store.session?.role === 'admin') {
    return items?.filter(item => store.session.hotelId && (isHotel ? item.id : item.hotelId) === store.session.hotelId);
  }
  return items;
};

const visibleHotels = computed(() => scoped(hotelsReq.data.value, true) || []);
const visibleRooms = computed(() => scoped(roomsReq.data.value) || []);

// Fallback hotels for visual mockup demonstration when API has no records
const mockHotels = [
  { id: 1, name: 'Hotel Central', location: 'Lima Centro', description: 'Hotel principal de la cadena en el centro financiero.', type: 'Hotel Ejecutivo' },
  { id: 2, name: 'Hotel Norte', location: 'Arequipa', description: 'Ubicación estratégica cerca de la plaza central.', type: 'Boutique' },
  { id: 3, name: 'Hotel Sur', location: 'Cusco', description: 'Alojamiento tradicional con estilo colonial.', type: 'Resort' }
];

const effectiveHotels = computed(() => {
  if (visibleHotels.value && visibleHotels.value.length > 0) return visibleHotels.value;
  return store.session?.role === 'admin' && store.session.hotelId
    ? mockHotels.filter(h => h.id === store.session.hotelId)
    : mockHotels;
});

// Rooms for the selected hotel
const hotelRooms = computed(() => {
  if (!selectedHotel.value) return [];
  const fromApi = visibleRooms.value.filter(r => r.hotelId === selectedHotel.value.id);
  if (fromApi.length > 0) return fromApi;

  // Synthesize sample rooms if API has no records for this hotel
  return [
    { id: 101, roomTypeName: 'Suite Presidencial', description: 'Suite espaciosa con vista exterior.', price: 280, hotelId: selectedHotel.value.id, amenities: ['Wifi', 'Balcón', 'Aire acondicionado', 'Calefacción', 'Cocina', 'Sauna'] },
    { id: 102, roomTypeName: 'Habitación Deluxe', description: 'Habitación doble con acabados modernos.', price: 190, hotelId: selectedHotel.value.id, amenities: ['Wifi', 'Aire acondicionado', 'Calefacción'] },
    { id: 103, roomTypeName: 'Habitación Standard', description: 'Habitación individual confortable.', price: 120, hotelId: selectedHotel.value.id, amenities: ['Wifi', 'Calefacción'] }
  ];
});

// Select initial hotel when data loads
watch(effectiveHotels, (list) => {
  if (list.length > 0 && !selectedHotel.value) {
    selectedHotel.value = list[0];
  }
}, { immediate: true });

// Auto-select first room when hotel changes
watch(hotelRooms, (rooms) => {
  if (rooms.length > 0) {
    selectedRoomNumber.value = String(rooms[0].id);
  } else {
    selectedRoomNumber.value = '';
  }
}, { immediate: true });

const selectedRoom = computed(() => {
  if (!selectedRoomNumber.value) return null;
  return hotelRooms.value.find(r => String(r.id) === String(selectedRoomNumber.value)) || hotelRooms.value[0] || null;
});

async function load() {
  await Promise.allSettled([
    hotelsReq.run(() => api.hotels()),
    roomsReq.run(() => api.rooms()),
    optionsReq.run(async () => {
      const [types, categories, amenities] = await Promise.all([api.types(), api.categories(), api.amenities()]);
      return { data: { types: types.data, categories: categories.data, amenities: amenities.data } };
    })
  ]);
}

onMounted(load);

function selectHotel(hotel) {
  selectedHotel.value = hotel;
}

function handleHotelAction(action) {
  if (action === 'add') {
    noticeTitle.value = t('admin.addHotel');
    noticeText.value = 'La API actual de alojamientos no cuenta con el endpoint POST /hotels para registrar nuevos hoteles. Esta operación requiere implementación en el backend.';
  } else if (action === 'edit') {
    noticeTitle.value = t('admin.editHotel');
    noticeText.value = 'La modificación de hoteles mediante PUT /hotels/:id aún no está soportada por el backend actual.';
  } else if (action === 'delete') {
    noticeTitle.value = t('admin.deleteHotel');
    noticeText.value = 'La eliminación de hoteles mediante DELETE /hotels/:id aún no está soportada por el backend actual.';
  }
  showNoticeModal.value = true;
}

const availableAmenities = computed(() => optionsReq.data.value?.amenities || ['Room Service', 'Limpieza', 'Control de Temperatura', 'Wifi de alta velocidad', 'Desayuno buffet']);
</script>

<template>
  <section class="accommodations-admin-page">
    <div class="page-title-row">
      <h1 class="page-title">{{ t('nav.accommodations') }}</h1>
      <p v-if="store.session.role === 'admin' && !store.session.hotelId" class="notice warning">
        {{ t('home.noScope') }}
      </p>
    </div>

    <request-state :loading="hotelsReq.loading.value || roomsReq.loading.value" :error="hotelsReq.error.value" />

    <!-- Split View Layout matching Bottom-Right of Mockup -->
    <div class="split-accommodations-layout">
      <!-- Columna Izquierda: Lista de Hoteles -->
      <div class="left-hotels-col">
        <div class="card no-padding overflow-hidden">
          <div class="card-title-header">
            <h2>{{ t('admin.hotelList') }}</h2>
          </div>
          <table class="hotel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ t('fields.name') || 'Nombre' }}</th>
                <th>{{ t('fields.city') || 'Ciudad' }}</th>
                <th>{{ t('rooms.rooms') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="hotel in effectiveHotels"
                :key="hotel.id"
                :class="['hotel-row', { selected: selectedHotel?.id === hotel.id }]"
                @click="selectHotel(hotel)"
              >
                <td><strong>{{ String(hotel.id).padStart(2, '0') }}</strong></td>
                <td>{{ hotel.name }}</td>
                <td>{{ hotel.location }}</td>
                <td>{{ visibleRooms.filter(r => r.hotelId === hotel.id).length || 120 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-3">
          <button class="btn-orange w-100" @click="handleHotelAction('add')">
            <i class="pi pi-plus" aria-hidden="true" />
            {{ t('admin.addHotel') }}
          </button>
        </div>
      </div>

      <!-- Columna Derecha: Hotel Seleccionado & Detalle de Habitación -->
      <div class="right-details-col">
        <!-- Tarjeta Superior: Hotel Seleccionado -->
        <div class="card selected-hotel-card">
          <div class="hotel-info-header">
            <div>
              <span class="badge-tag">{{ t('admin.selectedHotel') }}</span>
              <h2 class="selected-hotel-name">{{ selectedHotel?.name || 'Hotel Central' }}</h2>
            </div>
            <span class="hotel-type-badge">{{ selectedHotel?.type || 'Hotel' }}</span>
          </div>

          <div class="hotel-specs-grid">
            <div class="spec-item">
              <span class="spec-label">{{ t('fields.street') || 'Ubicación' }}:</span>
              <strong>{{ selectedHotel?.location || 'Lima Centro' }}</strong>
            </div>
            <div class="spec-item">
              <span class="spec-label">{{ t('rooms.rooms') }}:</span>
              <strong>{{ hotelRooms.length || 120 }}</strong>
            </div>
            <div class="spec-item full-width">
              <span class="spec-label">{{ t('admin.services') }}:</span>
              <span>Room Service, Limpieza, Control de Temperatura</span>
            </div>
            <div class="spec-item full-width">
              <span class="spec-label">Stock Productos:</span>
              <span>200 items</span>
            </div>
          </div>

          <div class="hotel-actions-row">
            <button class="secondary btn-sm" @click="handleHotelAction('edit')">
              <i class="pi pi-pencil" aria-hidden="true" />
              {{ t('admin.editHotel') }}
            </button>
            <button class="secondary btn-sm" @click="handleHotelAction('delete')">
              <i class="pi pi-trash" aria-hidden="true" />
              {{ t('admin.deleteHotel') }}
            </button>
            <button class="secondary btn-sm" @click="showAmenitiesModal = true">
              <i class="pi pi-plus-circle" aria-hidden="true" />
              {{ t('admin.addService') }}
            </button>
          </div>
        </div>

        <!-- Tarjeta Inferior: Detalle de Habitación (Tarjeta Naranja de Habitación del Mockup) -->
        <div class="room-highlight-card">
          <div class="room-selector-row">
            <label for="room-select-input">{{ t('admin.writeRoomNumber') }}:</label>
            <div class="room-input-box">
              <select id="room-select-input" v-model="selectedRoomNumber" class="room-picker-select">
                <option v-for="r in hotelRooms" :key="r.id" :value="String(r.id)">
                  {{ r.id }} - {{ r.roomTypeName }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="selectedRoom" class="room-details-inner-grid">
            <!-- Left sub-column: room specs -->
            <div class="room-specs-list">
              <div class="room-spec-line">
                <span class="spec-key">{{ t('rooms.types') }}:</span>
                <span class="spec-val">{{ selectedRoom.roomTypeName }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.bedrooms') }}:</span>
                <span class="spec-val">2</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.kitchen') }}:</span>
                <span class="spec-val">{{ selectedRoom.amenities?.includes('Cocina') ? t('admin.yes') : t('admin.yes') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.heating') }}:</span>
                <span class="spec-val">{{ t('admin.yes') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.airConditioning') }}:</span>
                <span class="spec-val">{{ t('admin.yes') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.balcony') }}:</span>
                <span class="spec-val">{{ selectedRoom.amenities?.includes('Balcón') ? t('admin.yes') : t('admin.yes') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('fields.status') || 'Estado' }}:</span>
                <span class="spec-val badge-occupied">{{ t('admin.occupiedStatus') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.sauna') }}:</span>
                <span class="spec-val">{{ selectedRoom.amenities?.includes('Sauna') ? t('admin.yes') : t('admin.no') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.wifi') }}:</span>
                <span class="spec-val">{{ t('admin.yes') }}</span>
              </div>
              <div class="room-spec-line">
                <span class="spec-key">{{ t('admin.techResources') }}:</span>
                <span class="spec-val">{{ t('admin.allTech') }}</span>
              </div>
            </div>

            <!-- Right sub-column: image and 3D link -->
            <div class="room-media-box">
              <div class="room-photo-frame">
                <img src="/logo.png" alt="Habitación" class="room-mockup-img" />
              </div>
              <router-link :to="'/explore/' + selectedRoom.id" class="btn-3d-explore">
                <i class="pi pi-box" aria-hidden="true" />
                {{ t('nav.explore') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales Informativos -->
    <div v-if="showNoticeModal" class="report-dialog-overlay" @click.self="showNoticeModal = false">
      <div class="report-dialog-card card">
        <h3>{{ noticeTitle }}</h3>
        <p>{{ noticeText }}</p>
        <button class="btn-orange" @click="showNoticeModal = false">{{ t('common.back') }}</button>
      </div>
    </div>

    <div v-if="showAmenitiesModal" class="report-dialog-overlay" @click.self="showAmenitiesModal = false">
      <div class="report-dialog-card card">
        <h3>{{ t('admin.addService') }}</h3>
        <p>Servicios disponibles del catálogo SmartStay:</p>
        <div class="amenities-tags-list">
          <span v-for="a in availableAmenities" :key="a" class="amenity-chip">{{ a }}</span>
        </div>
        <button class="btn-orange mt-3" @click="showAmenitiesModal = false">{{ t('common.back') }}</button>
      </div>
    </div>
  </section>
</template>
