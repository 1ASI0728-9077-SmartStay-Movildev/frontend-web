import { createRouter, createWebHistory, RouterView } from 'vue-router'
import HomeView from './shared/presentation/views/home.vue'
import PageNotFoundView from './shared/presentation/views/page-not-found.vue'
import iamRoutes from './iam/presentation/iam-routes.js'
import monitoringRoutes from './monitoring/presentation/monitoring-routes.js'

import Layout from "./shared/presentation/components/layout.vue";
import AuthenticationSection from "./iam/presentation/components/authentication-section.vue";
import {authenticationGuard} from "./iam/infrastructure/authentication.guard.js";

const routes = [
    { path: '/', redirect: '/home'},
    { path: '/auth', component: AuthenticationSection, children: iamRoutes},

    { path: '/', component: Layout, children: [
            { path: '', redirect: 'home'},
            { path: '/home', name: 'home', component: HomeView },
            { path: '/monitoring', component: RouterView, children: monitoringRoutes },
        ]
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFoundView }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
})

/**
 * Global navigation guard that updates the document title and delegates auth when enabled.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Previous route.
 * @param {import('vue-router').NavigationGuardNext} next - Guard continuation callback.
 * @returns {void}
 */
router.beforeEach((to, from) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    // Set the page title
    let baseTitle = 'TerraTech';
    document.title = `${baseTitle} - ${to.meta['title']}`;
    // When IAM is implemented, use:
    return authenticationGuard(to, from);
    // if not, use:
    // return true;
});

export default router