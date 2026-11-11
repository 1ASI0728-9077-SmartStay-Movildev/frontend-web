<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue';
import { useMonitoringStore } from '../../application/monitoring.store.js';
import { onMounted, toRefs, ref, computed } from 'vue';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useMonitoringStore();
const { devices, fields, errors, devicesLoaded, fieldsLoaded } = toRefs(store);
const { fetchDevices, fetchFields, deleteDevice } = store;

const filterStatus = ref('ALL');

const filteredDevices = computed(() => {
  if (filterStatus.value === 'ALL') return devices.value;
  return devices.value.filter(d => d.status === filterStatus.value);
});

onMounted(async () => {
  if (!devicesLoaded.value) await fetchDevices();
  if (!fieldsLoaded.value) await fetchFields();
});

const navigateToCreate = () => router.push({ name: 'monitoring-device-new' });
const navigateToEdit = (device) => router.push({ name: 'monitoring-device-edit', params: { id: device.id } });
const navigateToFields = () => router.push({ name: 'monitoring-fields' });

const confirmDelete = (device) => {
  confirm.require({
    message: t('monitoring.confirm-delete-device', { name: device.mac_address || device.id }),
    header: t('monitoring.delete-device-title'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteDevice(device),
  });
};

const getStatusBadge = (status) => {
  const map = {
    ONLINE: { class: 'badge-online', text: t('monitoring.status-active') },
    OFFLINE: { class: 'badge-offline', text: t('monitoring.status-inactive') },
    LOW_BATTERY: { class: 'badge-lowbat', text: t('monitoring.status-error') }
  };
  return map[status] || { class: 'badge-default', text: status };
};

const getFieldName = (fieldId) => {
  const field = fields.value.find(f => f.id === fieldId);
  return field ? field.name : fieldId;
};
</script>

<template>
  <div class="device-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('monitoring.devices') }}</h1>
        <p class="page-description">{{ t('monitoring.devices-subtitle') || 'Gestiona los dispositivos IoT de tus zonas' }}</p>
      </div>
      <div class="header-buttons">
        <div class="btn-wrapper">
          <pv-button
              icon="pi pi-map-marker"
              :label="t('monitoring.manage-fields')"
              class="btn-secondary"
              @click="navigateToFields"
          />
        </div>
        <div class="btn-wrapper">
          <pv-button
              icon="pi pi-plus"
              :label="t('monitoring.new-device')"
              class="btn-primary"
              @click="navigateToCreate"
          />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">{{ t('monitoring.filter-by-status') }}</label>
          <pv-select
              v-model="filterStatus"
              :options="[
              { label: t('monitoring.all'), value: 'ALL' },
              { label: t('monitoring.status-active'), value: 'ONLINE' },
              { label: t('monitoring.status-inactive'), value: 'OFFLINE' },
              { label: t('monitoring.status-error'), value: 'LOW_BATTERY' }
            ]"
              option-label="label"
              option-value="value"
              class="filter-select"
          />
        </div>
      </div>

      <pv-data-table
          :value="filteredDevices"
          responsive-layout="scroll"
          paginator
          :rows="10"
          :rows-per-page-options="[5, 10, 20, 50]"
          striped-rows
          class="custom-table"
      >
        <pv-column field="id" :header="t('monitoring.device-id')" sortable style="width: 110px; min-width: 110px; max-width: 110px;"></pv-column>
        <pv-column field="field_id" :header="t('monitoring.field')" sortable style="width: 140px; min-width: 140px; max-width: 140px;">
          <template #body="{ data }">
            {{ getFieldName(data.field_id) }}
          </template>
        </pv-column>
        <pv-column field="mac_address" :header="t('monitoring.mac-address')" sortable style="width: 150px; min-width: 150px; max-width: 150px;"></pv-column>
        <pv-column field="status" :header="t('monitoring.status')" sortable style="width: 100px; min-width: 100px; max-width: 100px;">
          <template #body="{ data }">
            <span :class="['status-badge', getStatusBadge(data.status).class]">
              {{ getStatusBadge(data.status).text }}
            </span>
          </template>
        </pv-column>
        <pv-column field="last_sync" :header="t('monitoring.last-sync')" sortable style="width: 150px; min-width: 150px; max-width: 150px;">
          <template #body="{ data }">
            {{ new Date(data.last_sync).toLocaleString() }}
          </template>
        </pv-column>
        <pv-column header="Actions" :header-style="{ width: '100px' }" body-style="text-align: center" style="width: 100px; min-width: 100px; max-width: 100px;">
          <template #body="{ data }">
            <div class="action-buttons">
              <div class="btn-wrapper-action">
                <pv-button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text btn-edit"
                    @click="navigateToEdit(data)"
                    v-tooltip.top="t('monitoring.edit')"
                />
              </div>
              <div class="btn-wrapper-action">
                <pv-button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text btn-delete"
                    @click="confirmDelete(data)"
                    v-tooltip.top="t('monitoring.delete')"
                />
              </div>
            </div>
          </template>
        </pv-column>
        <template #empty>
          <div class="empty-table">
            <i class="pi pi-inbox"></i>
            <p>{{ t('monitoring.no-devices') || 'No hay dispositivos registrados' }}</p>
          </div>
        </template>
      </pv-data-table>

      <div v-if="errors.length" class="error-container">
        <div v-for="(err, idx) in errors" :key="idx" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ err.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-list-page {
  --primary: #10b981;
  --primary-hover: #059669;
  --secondary: #3b82f6;
  --secondary-hover: #2563eb;
  --danger: #ef4444;
  --text-primary: #1A2B4C;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --radius: 1rem;

  padding: 1.5rem;
  background-color: var(--bg-page);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.page-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}
.page-description {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

/* ============================================================
   BOTONES - WRAPPER PARA EVITAR MOVIMIENTO
   ============================================================ */
.header-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-wrapper {
  display: inline-flex;
  position: relative;
}

.btn-wrapper-action {
  display: inline-flex;
  position: relative;
}

.btn-primary,
.btn-secondary {
  border: none;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  position: relative;
}

.btn-primary {
  background-color: var(--primary);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: var(--secondary);
}

.btn-secondary:hover {
  background-color: var(--secondary-hover);
}

/* Eliminar ripple en botones principales */
.btn-primary :deep(.p-ink),
.btn-secondary :deep(.p-ink) {
  display: none !important;
}

.btn-edit,
.btn-delete {
  transition: background-color 0.2s ease;
}

.btn-edit {
  color: var(--secondary);
}

.btn-edit:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.btn-delete {
  color: var(--danger);
}

.btn-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Eliminar ripple en botones de acción */
.btn-edit :deep(.p-ink),
.btn-delete :deep(.p-ink) {
  display: none !important;
}

/* Fijar tamaño de los botones de acción */
.btn-edit,
.btn-delete {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}

.card {
  background-color: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  padding: 1.5rem;
}
.filters-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.filter-label {
  font-weight: 500;
  color: var(--text-primary);
}
.filter-select {
  width: 200px;
}
.custom-table :deep(.p-datatable-wrapper) {
  border-radius: 0.75rem;
  overflow-x: auto;
}
.custom-table :deep(th) {
  background-color: #64748b;
  color: #FFFFFF;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.3;
  text-align: center;
}
.custom-table :deep(td) {
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
}
.custom-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: #ffffff;
}
.custom-table :deep(.p-datatable-tbody > tr:nth-child(odd)) {
  background-color: #f8fafc;
}
.custom-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: #e8f5e9;
}
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}
.badge-online {
  background: #e8f5e9;
  color: #2e7d32;
}
.badge-offline {
  background: #ffebee;
  color: #c62828;
}
.badge-lowbat {
  background: #fff3e0;
  color: #ed6c02;
}
.badge-default {
  background: #e0e0e0;
  color: #424242;
}
.empty-table {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}
.empty-table i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: inline-block;
}
.error-container {
  margin-top: 1rem;
}
.error-message {
  background-color: #fee2e2;
  color: var(--danger);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
@media (max-width: 768px) {
  .device-list-page { padding: 1rem; }
  .card { padding: 1rem; }
  .filter-group { width: 100%; }
  .filter-select { flex: 1; }
  .header-buttons { width: 100%; justify-content: stretch; }
  .header-buttons .p-button { flex: 1; }
}
</style>