<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useMonitoringStore } from '../../application/monitoring.store.js';
import { computed, onMounted, ref } from 'vue';
import { Field } from '../../domain/model/field.entity.js';
import useIamStore from "../../../iam/application/iam.store.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useMonitoringStore();
const iamStore = useIamStore();
const { errors, addField, updateField } = store;

const form = ref({
  name: '',
  size_m2: null,
  soil_type: '',
  latitude: null,
  longitude: null
});

const submitted = ref(false);
const isEdit = computed(() => !!route.params.id);
const formTitle = computed(() => isEdit.value ? t('monitoring.edit-field') : t('monitoring.new-field'));

const soilTypeOptions = [
  { label: 'Sandy', value: 'Sandy' },
  { label: 'Clay-loam', value: 'Clay-loam' },
  { label: 'Stony', value: 'Stony' },
  { label: 'Organic', value: 'Organic' },
  { label: 'Silty', value: 'Silty' }
];

onMounted(() => {
  if (isEdit.value) {
    const field = store.getFieldById(route.params.id);
    if (field) {
      form.value = {
        name: field.name || '',
        size_m2: field.size_m2 || null,
        soil_type: field.soil_type || '',
        latitude: field.latitude || null,
        longitude: field.longitude || null
      };
    } else {
      navigateBack();
    }
  }
});

function navigateBack() {
  router.push({ name: 'monitoring-fields' });
}

function submit() {
  submitted.value = true;
  if (!form.value.name || !form.value.size_m2 || !form.value.soil_type || form.value.latitude === null || form.value.longitude === null) {
    return;
  }

  // Obtener el profile_id del usuario actual desde el store de IAM
  const currentUserId = iamStore.currentUserId || 1;

  const fieldData = {
    profile_id: currentUserId,
    name: form.value.name,
    size_m2: form.value.size_m2,
    soil_type: form.value.soil_type,
    latitude: form.value.latitude,
    longitude: form.value.longitude
  };

  const field = new Field(fieldData);

  if (isEdit.value) {
    field.id = route.params.id;
    updateField(field);
  } else {
    addField(field);
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
  <div class="field-form-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ formTitle }}</h1>
        <p class="page-description">{{ t('monitoring.field-form-subtitle') || 'Completa los datos de la zona de cultivo' }}</p>
      </div>
    </div>

    <div class="card">
      <form @submit.prevent="submit" class="field-form">
        <div class="form-group">
          <label for="name" class="form-label required">{{ t('monitoring.name') }}</label>
          <pv-input-text
              id="name"
              v-model="form.name"
              :placeholder="t('monitoring.field-name-placeholder')"
              :class="{ 'p-invalid': submitted && !form.name }"
              autofocus
          />
          <small v-if="submitted && !form.name" class="error-text">{{ t('monitoring.name-required') }}</small>
        </div>

        <div class="form-group">
          <label for="size_m2" class="form-label required">{{ t('monitoring.size-m2') }}</label>
          <pv-input-number
              id="size_m2"
              v-model="form.size_m2"
              :placeholder="t('monitoring.size-placeholder')"
              :min="0"
              :max="999999.99"
              :class="{ 'p-invalid': submitted && !form.size_m2 }"
              mode="decimal"
          />
          <small v-if="submitted && !form.size_m2" class="error-text">{{ t('monitoring.size-required') }}</small>
        </div>

        <div class="form-group">
          <label for="soil_type" class="form-label required">{{ t('monitoring.soil-type') }}</label>
          <pv-select
              id="soil_type"
              v-model="form.soil_type"
              :options="soilTypeOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('monitoring.select-soil-type')"
              :class="{ 'p-invalid': submitted && !form.soil_type }"
          />
          <small v-if="submitted && !form.soil_type" class="error-text">{{ t('monitoring.soil-type-required') }}</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="latitude" class="form-label required">{{ t('monitoring.latitude') }}</label>
            <pv-input-number
                id="latitude"
                v-model="form.latitude"
                :placeholder="t('monitoring.latitude-placeholder')"
                :min="-90"
                :max="90"
                :class="{ 'p-invalid': submitted && form.latitude === null }"
                mode="decimal"
            />
            <small v-if="submitted && form.latitude === null" class="error-text">{{ t('monitoring.latitude-required') }}</small>
          </div>

          <div class="form-group">
            <label for="longitude" class="form-label required">{{ t('monitoring.longitude') }}</label>
            <pv-input-number
                id="longitude"
                v-model="form.longitude"
                :placeholder="t('monitoring.longitude-placeholder')"
                :min="-180"
                :max="180"
                :class="{ 'p-invalid': submitted && form.longitude === null }"
                mode="decimal"
            />
            <small v-if="submitted && form.longitude === null" class="error-text">{{ t('monitoring.longitude-required') }}</small>
          </div>
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
.field-form-container {
  --primary-color: #10b981;
  --primary-hover: #059669;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --danger: #ef4444;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

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
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  padding: 2rem;
}

.field-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group {
  flex: 1;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-submit {
  background-color: var(--primary-color);
  border: none;
  padding: 0.6rem 1rem;
  flex: 1;
  transition: all 0.2s;
}
.btn-submit:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
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
  .field-form-container {
    padding: 1rem;
  }
  .card {
    padding: 1.5rem;
  }
  .form-actions {
    flex-direction: column;
  }
  .form-row {
    flex-direction: column;
  }
}
</style>