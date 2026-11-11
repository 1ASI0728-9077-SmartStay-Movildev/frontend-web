const storageitemProgram = () => import('./views/storageitem-program.vue');

const shelvingRoutes = [
    {   path: 'items/new',   name: 'new_storage_item',   component: storageitemProgram,    meta: {title: 'new_storage_item'}}
];

export default shelvingRoutes;