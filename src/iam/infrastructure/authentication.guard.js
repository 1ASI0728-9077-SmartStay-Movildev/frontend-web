import useIamStore from "../application/iam.store.js";

/**
 * Navigation guard that protects non-public routes for anonymous users.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Current route.
 * @returns {void}
 */
export const authenticationGuard = (to, from) => {
    const store = useIamStore();
    const isAnonymous = !store.isSignedIn;
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/page-not-found'];
    const routeRequiresToBeAuthenticated = !publicRoutes.includes(to.path);
    if (isAnonymous && routeRequiresToBeAuthenticated) return {path: '/auth/login'};
    return true;
}