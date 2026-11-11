const deviceList = () => import('./views/device-list.vue');
const deviceForm = () => import('./views/device-form.vue');
const fieldList = () => import('./views/field-list.vue');
const fieldForm = () => import('./views/field-form.vue');

const monitoringRoutes = [
    { path: 'fields',           name: 'monitoring-fields',      component: fieldList,  meta: { title: 'Fields' } },
    { path: 'fields/new',       name: 'monitoring-field-new',   component: fieldForm,  meta: { title: 'New Field' } },
    { path: 'fields/:id/edit',  name: 'monitoring-field-edit',  component: fieldForm,  meta: { title: 'Edit Field' } },
    { path: 'devices',          name: 'monitoring-devices',     component: deviceList, meta: { title: 'Devices' } },
    { path: 'devices/new',      name: 'monitoring-device-new',  component: deviceForm, meta: { title: 'New Device' } },
    { path: 'devices/:id/edit', name: 'monitoring-device-edit', component: deviceForm, meta: { title: 'Edit Device' } }
];

export default monitoringRoutes;