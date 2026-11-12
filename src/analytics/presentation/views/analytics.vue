<script setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';
import { AnalyticsApi } from '../../infrastructure/analytics-api.js';
import { AccommodationsApi } from '../../../accommodations/infrastructure/accommodations-api.js';
import { BookingsApi } from '../../../bookings/infrastructure/bookings-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement);

const { t } = useI18n();
const { number, date } = useFormat();
const analyticsApi = new AnalyticsApi();
const accommodationsApi = new AccommodationsApi();
const bookingsApi = new BookingsApi();

const analyticsReq = useRequest();
const hotelsReq = useRequest();
const bookingsReq = useRequest();

const showReportDialog = ref(false);
const reportDialogTitle = ref('');
const reportDialogContent = ref('');

async function load() {
  await Promise.allSettled([
    analyticsReq.run(() => analyticsApi.monthly()),
    hotelsReq.run(() => accommodationsApi.hotels()),
    bookingsReq.run(() => bookingsApi.all())
  ]);
}

onMounted(load);

const metrics = computed(() => analyticsReq.data.value || null);
const hotels = computed(() => hotelsReq.data.value || []);
const bookings = computed(() => bookingsReq.data.value || []);

const occupancyValue = computed(() => {
  const val = metrics.value?.occupancyRate;
  return typeof val === 'number' && !isNaN(val) ? Math.min(Math.max(val, 0), 100) : 40;
});

const reservedValue = computed(() => {
  const total = metrics.value?.totalBookings || 0;
  const cancelled = metrics.value?.cancelledBookings || 0;
  const active = Math.max(total - cancelled, 0);
  if (total === 0) return 25;
  const ratio = Math.round((active / (total || 1)) * 30);
  return Math.min(Math.max(ratio, 10), 40);
});

const freeValue = computed(() => {
  const remaining = 100 - (occupancyValue.value + reservedValue.value);
  return Math.max(remaining, 5);
});

const revenueBarChartData = computed(() => {
  const baseRevenue = metrics.value?.totalRevenue || 7852000;
  const labels = ['1 Dic', '2 Dic', '3 Dic', '4 Dic', '5 Dic', '6 Dic', '7 Dic', '8 Dic', '9 Dic', '10 Dic', '11 Dic', '12 Dic'];
  const primaryValues = [45, 62, 58, 75, 90, 82, 95, 88, 72, 85, 98, 100].map(v => Math.round((v / 100) * (baseRevenue / 12)));
  const secondaryValues = [35, 48, 42, 55, 68, 60, 72, 65, 50, 62, 70, 78].map(v => Math.round((v / 100) * (baseRevenue / 12)));

  return {
    labels,
    datasets: [
      {
        label: t('admin.occupied'),
        backgroundColor: '#ff7a00',
        borderRadius: 4,
        data: primaryValues
      },
      {
        label: t('admin.free'),
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        data: secondaryValues
      }
    ]
  };
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#f1f5f9' }, ticks: { display: false } }
  }
};

const doughnutChartData = computed(() => ({
  labels: [t('admin.occupied'), t('admin.reserved'), t('admin.free')],
  datasets: [
    {
      data: [occupancyValue.value, reservedValue.value, freeValue.value],
      backgroundColor: ['#ff7a00', '#10b981', '#e2e8f0'],
      hoverOffset: 4,
      borderWidth: 0
    }
  ]
}));

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => ` ${context.label}: ${context.raw}%`
      }
    }
  }
};

const bookingsLineChartData = computed(() => {
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const baseBookings = metrics.value?.totalBookings || 2568;
  const recentDays = [120, 160, 140, 210, 260, 290, 310].map(v => Math.round((v / 300) * (baseBookings / 10)));
  const previousWeek = [110, 140, 130, 180, 220, 240, 270].map(v => Math.round((v / 300) * (baseBookings / 10)));

  return {
    labels,
    datasets: [
      {
        label: 'Últimos 6 días',
        borderColor: '#ff7a00',
        backgroundColor: 'rgba(255,122,0,0.1)',
        tension: 0.35,
        fill: true,
        data: recentDays
      },
      {
        label: 'Semana anterior',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.05)',
        tension: 0.35,
        fill: true,
        data: previousWeek
      }
    ]
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#f1f5f9' }, ticks: { display: false } }
  }
};

function openReport(type) {
  reportDialogTitle.value = type === 'revenue' ? t('admin.revenue') : t('admin.occupancyTotal');
  reportDialogContent.value = type === 'revenue'
    ? `${t('metrics.totalRevenue')}: ${number(metrics.value?.totalRevenue || 0)} · ${t('metrics.totalBookings')}: ${metrics.value?.totalBookings || 0}`
    : `${t('metrics.occupancyRate')}: ${occupancyValue.value}% · ${t('admin.occupied')}: ${occupancyValue.value}% · ${t('admin.reserved')}: ${reservedValue.value}% · ${t('admin.free')}: ${freeValue.value}%`;
  showReportDialog.value = true;
}
</script>

<template>
  <section class="admin-dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">{{ t('admin.dashboard') }}</h1>
        <small v-if="metrics?.generatedAt" class="dashboard-subtitle">
          {{ t('metrics.generatedAt') }}: {{ date(metrics.generatedAt) }}
        </small>
      </div>
      <button class="secondary btn-refresh" :disabled="analyticsReq.loading.value" @click="load">
        <i class="pi pi-refresh" aria-hidden="true" />
        {{ t('common.refresh') }}
      </button>
    </div>

    <request-state :loading="analyticsReq.loading.value" :error="analyticsReq.error.value" />

    <div v-if="metrics && !analyticsReq.loading.value" class="dashboard-grid">
      <!-- Card 1: Ingresos -->
      <article class="dash-card revenue-card">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">{{ t('admin.revenue') }}</h2>
            <div class="revenue-amount">
              PER {{ number(metrics.totalRevenue) }}
            </div>
            <div class="trend-badge positive">
              <i class="pi pi-arrow-up" aria-hidden="true" /> +2.1% vs last week
            </div>
          </div>
          <button class="btn-orange small-btn" @click="openReport('revenue')">
            {{ t('admin.viewReport') }}
          </button>
        </div>
        <div class="chart-container bar-chart">
          <Bar :data="revenueBarChartData" :options="barChartOptions" />
        </div>
      </article>

      <!-- Card 2: Ocupación Total -->
      <article class="dash-card occupancy-card">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">{{ t('admin.occupancyTotal') }}</h2>
            <small class="text-muted">6 Dic, 2026 - 12 Dic, 2026</small>
          </div>
          <button class="btn-orange small-btn" @click="openReport('occupancy')">
            {{ t('admin.viewReport') }}
          </button>
        </div>
        <div class="doughnut-wrapper">
          <div class="chart-container doughnut-chart">
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
            <div class="doughnut-center-label">
              <strong>{{ occupancyValue }}%</strong>
              <span>{{ t('admin.occupied') }}</span>
            </div>
          </div>
          <div class="doughnut-legend">
            <div class="legend-item">
              <span class="dot dot-orange" />
              <span>{{ t('admin.occupied') }} <strong>{{ occupancyValue }}%</strong></span>
            </div>
            <div class="legend-item">
              <span class="dot dot-green" />
              <span>{{ t('admin.reserved') }} <strong>{{ reservedValue }}%</strong></span>
            </div>
            <div class="legend-item">
              <span class="dot dot-gray" />
              <span>{{ t('admin.free') }} <strong>{{ freeValue }}%</strong></span>
            </div>
          </div>
        </div>
      </article>

      <!-- Card 3: Rating de Servicios -->
      <article class="dash-card rating-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">{{ t('admin.serviceRating') }}</h2>
        </div>
        <p class="dash-card-desc">Evaluación de calidad y satisfacción de huéspedes</p>
        <div class="rating-bubbles">
          <div class="bubble bubble-green">
            <span class="bubble-val">92%</span>
            <span class="bubble-lbl">{{ t('admin.packaging') }}</span>
          </div>
          <div class="bubble bubble-orange">
            <span class="bubble-val">85%</span>
            <span class="bubble-lbl">{{ t('admin.foodTaste') }}</span>
          </div>
          <div class="bubble bubble-blue">
            <span class="bubble-val">88%</span>
            <span class="bubble-lbl">{{ t('admin.serviceQuality') }}</span>
          </div>
        </div>
      </article>

      <!-- Card 4: Top de Hoteles -->
      <article class="dash-card top-hotels-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">{{ t('admin.topHotels') }}</h2>
          <small class="text-muted">Rendimiento por sede</small>
        </div>
        <div v-if="hotels.length" class="hotels-mini-list">
          <div v-for="hotel in hotels.slice(0, 4)" :key="hotel.id" class="hotel-mini-row">
            <div class="hotel-mini-avatar">
              <i class="pi pi-building" aria-hidden="true" />
            </div>
            <div class="hotel-mini-info">
              <strong>{{ hotel.name }}</strong>
              <small>{{ hotel.location }}</small>
            </div>
            <div class="hotel-mini-metric">
              <span class="tag-metric">{{ hotel.type || 'Hotel' }}</span>
            </div>
          </div>
        </div>
        <div v-else class="hotels-fallback-list">
          <div class="hotel-mini-row">
            <div class="hotel-mini-avatar"><i class="pi pi-building" /></div>
            <div class="hotel-mini-info"><strong>Hotel Central</strong><small>Lima Centro</small></div>
            <span class="tag-metric">S/ 48,000</span>
          </div>
          <div class="hotel-mini-row">
            <div class="hotel-mini-avatar"><i class="pi pi-building" /></div>
            <div class="hotel-mini-info"><strong>Hotel Norte</strong><small>Arequipa</small></div>
            <span class="tag-metric">S/ 38,200</span>
          </div>
          <div class="hotel-mini-row">
            <div class="hotel-mini-avatar"><i class="pi pi-building" /></div>
            <div class="hotel-mini-info"><strong>Hotel Sur</strong><small>Cusco</small></div>
            <span class="tag-metric">S/ 42,500</span>
          </div>
          <div class="hotel-mini-row">
            <div class="hotel-mini-avatar"><i class="pi pi-building" /></div>
            <div class="hotel-mini-info"><strong>Hotel Costa</strong><small>Ica</small></div>
            <span class="tag-metric">S/ 29,800</span>
          </div>
        </div>
      </article>

      <!-- Card 5: Reservas Diarias -->
      <article class="dash-card daily-bookings-card">
        <div class="dash-card-header">
          <div>
            <h2 class="dash-card-title">{{ t('admin.dailyBookings') }}</h2>
            <div class="bookings-metric">
              {{ number(metrics.totalBookings) }}
              <span class="trend-badge positive small">
                <i class="pi pi-arrow-up" aria-hidden="true" /> +3.7% vs last week
              </span>
            </div>
            <small class="text-muted">{{ t('metrics.cancelledBookings') }}: {{ metrics.cancelledBookings }}</small>
          </div>
          <router-link to="/bookings/manage" class="link-muted">
            {{ t('admin.viewReport') }}
          </router-link>
        </div>
        <div class="chart-container line-chart">
          <Line :data="bookingsLineChartData" :options="lineChartOptions" />
        </div>
      </article>
    </div>

    <!-- Modal Reporte -->
    <div v-if="showReportDialog" class="report-dialog-overlay" @click.self="showReportDialog = false">
      <div class="report-dialog-card card">
        <h3>{{ reportDialogTitle }}</h3>
        <p>{{ reportDialogContent }}</p>
        <button class="btn-orange" @click="showReportDialog = false">{{ t('common.back') }}</button>
      </div>
    </div>
  </section>
</template>
