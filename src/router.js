import { createRouter, createWebHistory } from 'vue-router';
import Layout from './shared/presentation/components/layout.vue';
import iamRoutes from './iam/presentation/iam-routes.js';
import { authenticationGuard } from './iam/infrastructure/authentication.guard.js';
import { memberRoles, adminRoles } from './shared/domain/permissions.js';
const view = (path, name, component, roles, isPublic = false) => ({ path, name, component, meta: { title: name, roles, public: isPublic } });
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/auth', component: () => import('./iam/presentation/components/authentication-section.vue'), children: iamRoutes },
  { path: '/', component: Layout, children: [
    view('home', 'home', () => import('./shared/presentation/views/home.vue')),
    view('catalog', 'catalog', () => import('./accommodations/presentation/views/catalog.vue'), undefined, true),
    view('explore', 'explore', () => import('./accommodations/presentation/views/explore.vue'), undefined, true),
    view('explore/:roomId(\\d+)', 'exploreRoom', () => import('./accommodations/presentation/views/explore.vue'), undefined, true),
    view('concierge', 'concierge', () => import('./concierge/presentation/views/concierge.vue'), undefined, true),
    view('bookings', 'bookings', () => import('./bookings/presentation/views/bookings.vue'), memberRoles),
    view('bookings/new', 'bookingNew', () => import('./bookings/presentation/views/booking-form.vue'), memberRoles),
    view('bookings/manage', 'bookingAdmin', () => import('./bookings/presentation/views/bookings.vue'), adminRoles),
    view('bookings/:id(\\d+)', 'bookingDetail', () => import('./bookings/presentation/views/booking-detail.vue'), memberRoles),
    view('payments', 'payments', () => import('./payments/presentation/views/payment.vue'), memberRoles),
    view('profile', 'profile', () => import('./profiles/presentation/views/profile.vue'), memberRoles),
    view('profiles', 'profiles', () => import('./profiles/presentation/views/profiles.vue'), adminRoles),
    view('users', 'users', () => import('./iam/presentation/views/users.vue'), adminRoles),
    view('accommodations', 'accommodations', () => import('./accommodations/presentation/views/accommodations.vue'), adminRoles),
    view('analytics', 'analytics', () => import('./analytics/presentation/views/analytics.vue'), adminRoles),
    view('forbidden', 'forbidden', () => import('./shared/presentation/views/forbidden.vue')),
  ] },
  view('/:pathMatch(.*)*', 'notFound', () => import('./shared/presentation/views/page-not-found.vue'), undefined, true),
];
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });
router.beforeEach(authenticationGuard);
export default router;
