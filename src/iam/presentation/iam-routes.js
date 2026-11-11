export default [{
  path: 'login', name: 'login', component: () => import('./views/sign-in.vue'),
  meta: { public: true, title: 'login' },
}];
