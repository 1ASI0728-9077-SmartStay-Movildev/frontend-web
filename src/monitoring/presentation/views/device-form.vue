<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useMonitoringStore } from '../../application/monitoring.store.js';
import { computed, onMounted, ref } from 'vue';
import { Device } from '../../domain/model/device.entity.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useMonitoringStore();
const { errors, addDevice, updateDevice } = store;

const form = ref({
  field_id: '',
  mac_address: '',
  status: '',
  last_sync: ''
});

const submitted = ref(false);
const isEdit = computed(() => !!route.params.id);
const formTitle = computed(() => isEdit.value ? t('monitoring.edit-device') : t('monitoring.new-device'));

const statusOptions = [
  { label: t('monitoring.status-active'), value: 'ONLINE' },
  { label: t('monitoring.status-inactive'), value: 'OFFLINE' },
  { label: t('monitoring.status-error'), value: 'LOW_BATTERY' }
];

onMounted(() => {
  if (isEdit.value) {
    const device = store.getDeviceById(route.params.id);
    if (device) {
      form.value = {
        field_id: device.field_id || '',
        mac_address: device.mac_address || '',
        status: device.status || '',
        last_sync: device.last_sync || ''
      };
    } else {
      navigateBack();
    }
  }
});

function navigateBack() {
  router.push({ name: 'monitoring-devices' });
}

function submit() {
  submitted.value = true;
  if (!form.value.field_id || !form.value.mac_address || !form.value.status) {
    return;
  }

  const device = new Device({ ...form.value });

  if (isEdit.value) {
    device.id = route.params.id;
    updateDevice(device);
  } else {
    addDevice(device);
  }

  setTimeout(() => {
    navigateBack();
  }, 500);
}

function cancel() {
  navigateBack();
}
</script>

<template>
  <div class="device-form-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ formTitle }}</h1>
        <p class="page-description">{{ t('monitoring.device-form-subtitle') || 'Registra un nuevo dispositivo IoT' }}</p>
      </div>
    </div>

    <div class="card">
      <form @submit.prevent="submit" class="device-form">
        <div class="form-group">
          <label for="field_id" class="form-label required">{{ t('monitoring.field') }}</label>
          <pv-input-text
              id="field_id"
              v-model="form.field_id"
              :placeholder="t('monitoring.field-id-placeholder')"
              :class="{ 'p-invalid': submitted && !form.field_id }"
              autofocus
          />
          <small class="helper-text">{{ t('monitoring.field-id-hint') }}</small>
          <small v-if="submitted && !form.field_id" class="error-text">{{ t('monitoring.field-required') }}</small>
        </div>

        <div class="form-group">
          <label for="mac_address" class="form-label required">{{ t('monitoring.mac-address') }}</label>
          <pv-input-text
              id="mac_address"
              v-model="form.mac_address"
              :placeholder="t('monitoring.mac-address-placeholder')"
              :class="{ 'p-invalid': submitted && !form.mac_address }"
          />
          <small v-if="submitted && !form.mac_address" class="error-text">{{ t('monitoring.mac-required') }}</small>
        </div>

        <div class="form-group">
          <label for="status" class="form-label required">{{ t('monitoring.status') }}</label>
          <pv-select
              id="status"
              v-model="form.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('monitoring.select-status')"
              :class="{ 'p-invalid': submitted && !form.status }"
          />
          <small v-if="submitted && !form.status" class="error-text">{{ t('monitoring.status-required') }}</small>
        </div>

        <div class="form-group">
          <label for="last_sync" class="form-label">{{ t('monitoring.last-sync') }}</label>
          <pv-input-text
              id="last_sync"
              v-model="form.last_sync"
              :placeholder="t('monitoring.last-sync-placeholder')"
          />
          <small class="helper-text">{{ t('monitoring.last-sync-hint') }}</small>
        </div>

        <div class="form-actions">
          <pv-button
              :label="isEdit ? t('monitoring.update') : t('monitoring.create')"
              icon="pi pi-check"
              type="submit"
              class="btn-submit"
          />
          <pv-button
              :label="t('monitoring.cancel')"
              icon="pi pi-times"
              severity="secondary"
              class="btn-cancel"
              @click="cancel"
          />
        </div>
      </form>

      <div v-if="errors.length" class="error-container">
        <div v-for="(err, idx) in errors" :key="idx" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ err.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-form-page {
  --primary: #10b981;
  --primary-hover: #059669;
  --secondary: #3b82f6;
  --danger: #ef4444;
  --text-primary: #1e293b;
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
  margin-bottom: 1.5rem;
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

.card {
  max-width: 700px;
  margin: 0 auto;
  background-color: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  padding: 2rem;
}

.device-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-label.required::after {
  content: '*';
  color: var(--danger);
  margin-left: 4px;
}

.helper-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.error-text {
  font-size: 0.75rem;
  color: var(--danger);
}

.loading-fields,
.no-fields-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}
.loading-fields {
  background-color: #e0f2fe;
  color: #0369a1;
}
.no-fields-warning {
  background-color: #fee2e2;
  color: var(--danger);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-submit {
  background-color: var(--primary);
  border: none;
  padding: 0.6rem 1rem;
  flex: 1;
  transition: all 0.2s;
}
.btn-submit:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  flex: 1;
}

.error-container {
  margin-top: 1.5rem;
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

@media (max-width: 600px) {
  .device-form-page {
    padding: 1rem;
  }
  .card {
    padding: 1.5rem;
  }
  .form-actions {
    flex-direction: column;
  }
}
</style>
