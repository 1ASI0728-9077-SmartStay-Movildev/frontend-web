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
const { fields, errors, fieldsLoaded } = toRefs(store);
const { fetchFields, deleteField } = store;

const soilTypeOptions = computed(() => {
  const uniqueTypes = [...new Set(fields.value.map(f => f.soil_type))];
  return [
    { label: t('monitoring.all'), value: 'ALL' },
    ...uniqueTypes.map(type => ({
      label: type,
      value: type
    }))
  ];
});

const selectedSoilType = ref('ALL');
const filteredFields = computed(() => {
  if (selectedSoilType.value === 'ALL') return fields.value;
  return fields.value.filter(f => f.soil_type === selectedSoilType.value);
});

onMounted(() => {
  if (!fieldsLoaded.value) fetchFields();
});

const navigateToCreate = () => router.push({ name: 'monitoring-field-new' });
const navigateToEdit = (field) => router.push({ name: 'monitoring-field-edit', params: { id: field.id } });
const navigateToDevices = () => router.push({ name: 'monitoring-devices' });

const confirmDelete = (field) => {
  confirm.require({
    message: t('monitoring.confirm-delete-field'),
    header: t('monitoring.delete-field-title'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteField(field),
  });
};
</script>

<template>
  <div class="field-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('monitoring.fields') }}</h1>
        <p class="page-description">{{ t('monitoring.fields-subtitle') || 'Administra tus zonas de cultivo' }}</p>
      </div>
      <div class="header-buttons">
        <pv-button
            icon="pi pi-microchip"
            :label="t('monitoring.manage-devices')"
            class="btn-secondary"
            @click="navigateToDevices"
        />
        <pv-button
            icon="pi pi-plus"
            :label="t('monitoring.new-field')"
            class="btn-primary"
            @click="navigateToCreate"
        />
      </div>
    </div>

    <div class="card">
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">{{ t('monitoring.filter-by-soil-type') }}</label>
          <pv-select
              v-model="selectedSoilType"
              :options="soilTypeOptions"
              option-label="label"
              option-value="value"
              class="filter-select"
              :placeholder="t('monitoring.all')"
          />
        </div>
      </div>

      <pv-data-table
          :value="filteredFields"
          responsive-layout="scroll"
          paginator
          :rows="10"
          :rows-per-page-options="[5, 10, 20, 50]"
          striped-rows
          class="custom-table"
      >
        <pv-column field="id" :header="t('monitoring.field-id')" sortable style="width: 15%"></pv-column>
        <pv-column field="name" :header="t('monitoring.name')" sortable style="width: 25%"></pv-column>
        <pv-column field="size_m2" :header="t('monitoring.size-m2')" sortable style="width: 15%">
          <template #body="{ data }">{{ data.size_m2 }} m²</template>
        </pv-column>
        <pv-column field="soil_type" :header="t('monitoring.soil-type')" sortable style="width: 15%">
          <template #body="{ data }">
            <span class="soil-badge">{{ data.soil_type }}</span>
          </template>
        </pv-column>
        <pv-column :header="t('monitoring.location')" sortable style="width: 20%">
          <template #body="{ data }">
            {{ data.latitude }}, {{ data.longitude }}
          </template>
        </pv-column>
        <pv-column header="Actions" :header-style="{ width: '80px' }" style="width: 10%">
          <template #body="{ data }">
            <div class="action-buttons">
              <pv-button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text btn-edit"
                  @click="navigateToEdit(data)"
                  v-tooltip.top="t('monitoring.edit')"
              />
              <pv-button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text btn-delete"
                  @click="confirmDelete(data)"
                  v-tooltip.top="t('monitoring.delete')"
              />
            </div>
          </template>
        </pv-column>
        <template #empty>
          <div class="empty-table">
            <i class="pi pi-inbox"></i>
            <p>{{ t('monitoring.no-fields') || 'No hay zonas de cultivo registradas' }}</p>
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
.field-list-page {
  --primary: #10b981;
  --primary-hover: #059669;
  --secondary: #3b82f6;
  --danger: #ef4444;
  --danger-hover: #dc2626;
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
  color: #1A2B4C;
  margin: 0 0 0.25rem 0;
}

.page-description {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.header-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  border: none;
  background-clip: padding-box;
  transition: background-color 0.2s ease;
}

.btn-primary:hover,
.btn-secondary:hover,
.btn-primary:active,
.btn-secondary:active,
.btn-primary:focus,
.btn-secondary:focus,
.btn-primary:focus-visible,
.btn-secondary:focus-visible {
  transform: none !important;
  scale: none !important;
  translate: none !important;
  margin: 0 !important;
  padding: 0.5rem 1.25rem !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
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
  background-color: #2563eb;
}

.btn-primary :deep(.p-ink),
.btn-secondary :deep(.p-ink) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
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

.custom-table :deep(table) {
  min-width: 800px;
}

.custom-table :deep(th) {
  background-color: #1A2B4C;
  color: #FFFFFF;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.custom-table :deep(td) {
  padding: 0.75rem 1rem;
  color: #1A2B4C;
  background-color: #FFFFFF;
  border-bottom: 1px solid var(--border);
}

.custom-table :deep(th),
.custom-table :deep(td) {
  white-space: nowrap;
}

.custom-table :deep(td:first-child),
.custom-table :deep(td:nth-child(2)) {
  white-space: normal;
  word-break: break-word;
}

/* Filas alternadas con colores claros */
.custom-table :deep(.p-row-even td) {
  background-color: #FFFFFF;
}

.custom-table :deep(.p-row-odd td) {
  background-color: #F8FAFC;
}

.soil-badge {
  display: inline-block;
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}
.btn-edit {
  color: var(--secondary);
  transition: background-color 0.2s ease;
}
.btn-edit:hover {
  background-color: rgba(59, 130, 246, 0.1);
}
.btn-delete {
  color: var(--danger);
  transition: background-color 0.2s ease;
}
.btn-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
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
  .field-list-page {
    padding: 1rem;
  }
  .card {
    padding: 1rem;
  }
  .filter-group {
    width: 100%;
  }
  .filter-select {
    flex: 1;
  }
  .header-buttons {
    width: 100%;
    justify-content: stretch;
  }
  .header-buttons .p-button {
    flex: 1;
  }
}
</style>