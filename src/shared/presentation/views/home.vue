<script setup>
import { useI18n } from "vue-i18n";
import { onMounted, computed } from "vue";
import { useMonitoringStore } from "../../../monitoring/application/monitoring.store.js";


const { t } = useI18n();

// Stores
const monitoringStore = useMonitoringStore();

// Computed para datos de gráficos
const deviceStatusData = computed(() => {
  const devices = monitoringStore.devices;
  const online = devices.filter(d => d.status === 'ONLINE').length;
  const offline = devices.filter(d => d.status === 'OFFLINE').length;
  const lowBattery = devices.filter(d => d.status === 'LOW_BATTERY').length;
  return { online, offline, lowBattery };
});

onMounted(() => {
  monitoringStore.fetchDevices();
  monitoringStore.fetchFields();

});
</script>

<template>
  <div class="home-container">
    <div class="home-header">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.content') }}</p>
    </div>

    <!-- Fila 1: Tarjetas de resumen -->
    <div class="dashboard-grid">
      <!-- Monitoring Card -->
      <div class="dashboard-card">
        <div class="card-icon monitoring">
          <i class="pi pi-map-marker"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.monitoring') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ monitoringStore.devices.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.devices') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ monitoringStore.fields.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.fields') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Commercial Card -->
      <div class="dashboard-card">
        <div class="card-icon commercial">
          <i class="pi pi-shopping-cart"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.catalog') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ commercialStore.products.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.products') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ commercialStore.orders.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.orders') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Card -->
      <div class="dashboard-card">
        <div class="card-icon inventory">
          <i class="pi pi-box"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.inventory') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ stockStore.inventory.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.products') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Card -->
      <div class="dashboard-card">
        <div class="card-icon notifications">
          <i class="pi pi-bell"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.notifications') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ notificationStore.notifications.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.total') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" style="color: #f44336;">{{ notificationStore.unreadCount }}</span>
              <span class="stat-label">{{ t('home.dashboard.unread') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Community Card -->
      <div class="dashboard-card">
        <div class="card-icon community">
          <i class="pi pi-users"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.community') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ communityStore.profiles.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.profiles') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Card -->
      <div class="dashboard-card">
        <div class="card-icon analytics">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.analytics') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ analyticsStore.reportsList.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.reports') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profiles Card -->
      <div class="dashboard-card">
        <div class="card-icon profiles">
          <i class="pi pi-user"></i>
        </div>
        <div class="card-content">
          <h3>{{ t('nav.settings') }}</h3>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-number">{{ profileStore.profiles.length }}</span>
              <span class="stat-label">{{ t('home.dashboard.profiles') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila 2: Gráficos -->
    <div class="charts-row">
      <!-- Gráfico de dispositivos -->
      <div class="chart-card" v-if="monitoringStore.devices.length > 0">
        <h4><i class="pi pi-microchip"></i> {{ t('home.dashboard.device-status') }}</h4>
        <div class="chart-bars">
          <div class="chart-bar-item">
            <div class="chart-bar-label">{{ t('monitoring.status-active') }}</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill online" :style="{ width: (deviceStatusData.online / maxDevices * 100) + '%' }"></div>
            </div>
            <div class="chart-bar-value">{{ deviceStatusData.online }}</div>
          </div>
          <div class="chart-bar-item">
            <div class="chart-bar-label">{{ t('monitoring.status-inactive') }}</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill offline" :style="{ width: (deviceStatusData.offline / maxDevices * 100) + '%' }"></div>
            </div>
            <div class="chart-bar-value">{{ deviceStatusData.offline }}</div>
          </div>
          <div class="chart-bar-item">
            <div class="chart-bar-label">{{ t('monitoring.status-error') }}</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill lowbat" :style="{ width: (deviceStatusData.lowBattery / maxDevices * 100) + '%' }"></div>
            </div>
            <div class="chart-bar-value">{{ deviceStatusData.lowBattery }}</div>
          </div>
        </div>
      </div>

      <!-- Gráfico de órdenes -->
      <div class="chart-card" v-if="commercialStore.orders.length > 0">
        <h4><i class="pi pi-shopping-cart"></i> {{ t('home.dashboard.order-status') }}</h4>
        <div class="chart-bars">
          <div class="chart-bar-item">
            <div class="chart-bar-label">{{ t('commercial.order-status') }}</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill pending" :style="{ width: (orderStatusData.pending / maxOrders * 100) + '%' }"></div>
            </div>
            <div class="chart-bar-value">{{ orderStatusData.pending }}</div>
          </div>
          <div class="chart-bar-item">
            <div class="chart-bar-label">Validated</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill validated" :style="{ width: (orderStatusData.validated / maxOrders * 100) + '%' }"></div>
            </div>
            <div class="chart-bar-value">{{ orderStatusData.validated }}</div>
          </div>
          <div class="chart-bar-item">
            <div class="chart-bar-label">Completed</div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill completed" :style="{ width: (orderStatusData.completed / maxOrders * 100) + '%' }"></div>
            </div>
            <div class="chart-bar-value">{{ orderStatusData.completed }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila 3: Tabla resumen de bounded contexts -->
    <div class="table-card">
      <h4><i class="pi pi-table"></i> {{ t('home.dashboard.bounded-contexts') }}</h4>
      <table class="summary-table">
        <thead>
        <tr>
          <th>{{ t('home.dashboard.bounded-contexts') }}</th>
          <th>{{ t('home.dashboard.total-items') }}</th>
          <th>{{ t('home.dashboard.status-details') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td><i class="pi pi-map-marker" style="color: #10b981;"></i> {{ t('nav.monitoring') }}</td>
          <td>{{ monitoringStore.devices.length + monitoringStore.fields.length }}</td>
          <td>{{ monitoringStore.devices.length }} {{ t('home.dashboard.devices') }}, {{ monitoringStore.fields.length }} {{ t('home.dashboard.fields') }}</td>
        </tr>
        <tr>
          <td><i class="pi pi-shopping-cart" style="color: #3b82f6;"></i> {{ t('nav.catalog') }}</td>
          <td>{{ commercialStore.products.length + commercialStore.orders.length }}</td>
          <td>{{ commercialStore.products.length }} {{ t('home.dashboard.products') }}, {{ commercialStore.orders.length }} {{ t('home.dashboard.orders') }}</td>
        </tr>
        <tr>
          <td><i class="pi pi-box" style="color: #f59e0b;"></i> {{ t('nav.inventory') }}</td>
          <td>{{ stockStore.inventory.length }}</td>
          <td>{{ stockStore.inventory.length }} {{ t('home.dashboard.products') }} {{ t('stock.title').toLowerCase() }}</td>
        </tr>
        <tr>
          <td><i class="pi pi-bell" style="color: #8b5cf6;"></i> {{ t('nav.notifications') }}</td>
          <td>{{ notificationStore.notifications.length }}</td>
          <td>{{ notificationStore.unreadCount }} {{ t('home.dashboard.unread') }} {{ t('notifications.title').toLowerCase() }}</td>
        </tr>
        <tr>
          <td><i class="pi pi-users" style="color: #ec4899;"></i> {{ t('nav.community') }}</td>
          <td>{{ communityStore.profiles.length }}</td>
          <td>{{ communityStore.profiles.length }} {{ t('community.profiles.title').toLowerCase() }}</td>
        </tr>
        <tr>
          <td><i class="pi pi-chart-line" style="color: #06b6d4;"></i> {{ t('nav.analytics') }}</td>
          <td>{{ analyticsStore.reportsList.length }}</td>
          <td>{{ analyticsStore.reportsList.length }} {{ t('home.dashboard.reports') }}</td>
        </tr>
        <tr>
          <td><i class="pi pi-user" style="color: #6b7280;"></i> {{ t('nav.settings') }}</td>
          <td>{{ profileStore.profiles.length }}</td>
          <td>{{ profileStore.profiles.length }} {{ t('profiles.title').toLowerCase() }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 1.5rem;
}

.home-header {
  margin-bottom: 2rem;
}

.home-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.home-header p {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  min-width: 0;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
  color: white;
}

.card-icon.monitoring { background: linear-gradient(135deg, #10b981, #059669); }
.card-icon.commercial { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.card-icon.inventory { background: linear-gradient(135deg, #f59e0b, #d97706); }
.card-icon.notifications { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.card-icon.community { background: linear-gradient(135deg, #ec4899, #db2777); }
.card-icon.analytics { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.card-icon.profiles { background: linear-gradient(135deg, #6b7280, #4b5563); }

.card-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.card-content h3 {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.3rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-stats {
  display: flex;
  gap: 1.2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-number {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.6rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.chart-card h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-bar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chart-bar-label {
  font-size: 0.75rem;
  color: #64748b;
  width: 75px;
  flex-shrink: 0;
}

.chart-bar-track {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.chart-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.chart-bar-fill.online { background: #10b981; }
.chart-bar-fill.offline { background: #ef4444; }
.chart-bar-fill.lowbat { background: #f59e0b; }
.chart-bar-fill.pending { background: #f59e0b; }
.chart-bar-fill.validated { background: #3b82f6; }
.chart-bar-fill.completed { background: #10b981; }

.chart-bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  width: 25px;
  text-align: right;
  flex-shrink: 0;
}
.table-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.table-card h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.summary-table thead th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
}

.summary-table tbody td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.summary-table tbody tr:hover {
  background: #f8fafc;
}

.summary-table tbody td:first-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-table tbody td:first-child i {
  width: 16px;
}

@media (max-width: 1024px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
  }

  .dashboard-card {
    padding: 0.75rem 1rem;
    flex-direction: column;
    text-align: center;
  }

  .card-stats {
    justify-content: center;
    gap: 0.75rem;
  }

  .summary-table {
    font-size: 0.75rem;
  }

  .summary-table thead th,
  .summary-table tbody td {
    padding: 0.4rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .dashboard-card {
    padding: 0.5rem;
  }

  .card-icon {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .card-content h3 {
    font-size: 0.65rem;
  }

  .stat-number {
    font-size: 0.8rem;
  }

  .stat-label {
    font-size: 0.5rem;
  }

  .chart-bar-label {
    width: 60px;
    font-size: 0.65rem;
  }
}
</style>