import { createRouter, createWebHistory} from 'vue-router'
import Home from './shared/presentation/views/home.vue'
import shelvingRoutes from "./shelving/presentation/shelving-routes.js";

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/',                redirect: '/home' },
    { path: '/home',            name: 'home',       component: Home,           meta: { title: 'Home' } },
    { path: '/storage',         name: 'storage',    children: shelvingRoutes,  meta: { title: 'Shelving' } },
    { path: '/:pathMatch(.*)*', name: 'not-found',  component: pageNotFound,   meta: { title: 'Page Not Found' } }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,

});

export default router