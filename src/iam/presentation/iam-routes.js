const loginForm = () => import( './views/sign-in.vue');
const registerForm = () => import( './views/sign-up.vue');
/**
 * Child routes exposed by the Identity and Access Management (IAM) bounded context.
 */
const iamRoutes = [
    { path: 'login',    name: 'login',    component: loginForm,    meta: { title: 'Sign In - TerraTech' } },
    { path: 'register', name: 'register', component: registerForm, meta: { title: 'Sign Up - TerraTech' } }
];

export default iamRoutes;