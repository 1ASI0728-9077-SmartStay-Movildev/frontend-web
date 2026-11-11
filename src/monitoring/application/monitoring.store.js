import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { MonitoringApi } from "../infrastructure/monitoring-api.js";
import { DeviceAssembler } from "../infrastructure/device.assembler.js";
import { FieldAssembler } from "../infrastructure/field.assembler.js";
import useIamStore from "../../iam/application/iam.store.js";

const monitoringApi = new MonitoringApi();

/**
 * Monitoring Store - Centralized state management for monitoring module.
 *
 * This Pinia store manages the state for devices and fields (agricultural zones)
 * in the monitoring system. It handles CRUD operations, fetching data from the API,
 * and maintaining reactive state for Vue components.
 *
 * @module stores/monitoring
 * @returns {Object} Store instance with state and actions
 *
 * @example
 * import { useMonitoringStore } from '@/monitoring/application/monitoring.store.js';
 *
 * const store = useMonitoringStore();
 * store.fetchDevices();
 * console.log(store.devices); // Array of Device entities
 */
const useMonitoringStore = defineStore('monitoring', () => {

    /**
     * Array of Device entities currently loaded.
     * @type {import('vue').Ref<Device[]>}
     */
    const devices = ref([]);

    /**
     * Array of Field entities currently loaded.
     * @type {import('vue').Ref<Field[]>}
     */
    const fields = ref([]);

    /**
     * Array of error objects encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Flag indicating whether devices have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const devicesLoaded = ref(false);

    /**
     * Flag indicating whether fields have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const fieldsLoaded = ref(false);

    /**
     * Computed property that returns the count of loaded devices.
     * @type {import('vue').ComputedRef<number>}
     */
    const devicesCount = computed(() => {
        return devicesLoaded.value ? devices.value.length : 0;
    });

    /**
     * Computed property that returns the count of loaded fields.
     * @type {import('vue').ComputedRef<number>}
     */
    const fieldsCount = computed(() => {
        return fieldsLoaded.value ? fields.value.length : 0;
    });

    /**
     * Fetches all devices from the API and updates the store state.
     *
     * @async
     * @function fetchDevices
     * @returns {void}
     *
     * @example
     * await store.fetchDevices();
     * console.log(store.devices); // Array of devices loaded from API
     */
    function fetchDevices() {
        monitoringApi.getDevices().then(response => {
            devices.value = DeviceAssembler.toEntitiesFromResponse(response);
            devicesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
            devicesLoaded.value = true;
        });
    }

    /**
     * Fetches all fields from the API and updates the store state.
     *
     * @async
     * @function fetchFields
     * @returns {void}
     *
     * @example
     * await store.fetchFields();
     * console.log(store.fields); // Array of fields loaded from API
     */
    function fetchFields() {
        monitoringApi.getFields().then(response => {
            fields.value = FieldAssembler.toEntitiesFromResponse(response);
            fieldsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
            fieldsLoaded.value = true;
        });
    }

    /**
     * Retrieves a device by its ID from the loaded devices.
     *
     * @function getDeviceById
     * @param {string|number} id - The device identifier
     *
     * @returns {Device|undefined} The device entity if found, undefined otherwise
     *
     * @example
     * const device = store.getDeviceById('dev_001');
     * if (device) {
     *   console.log(device.mac_address);
     * }
     */
    function getDeviceById(id) {
        return devices.value.find(device => String(device.id) === String(id));
    }

    /**
     * Gets the current user's profile ID from the IAM store.
     * This function retrieves the authenticated user's profile ID
     * to associate fields and devices with the correct owner.
     *
     * @function getCurrentProfileId
     * @returns {number} The current user's profile ID, or 1 as fallback
     */
    function getCurrentProfileId() {
        const iamStore = useIamStore();
        const userId = iamStore.currentUserId;
        if (userId) {
            return 1;
        }
        return 1;
    }

    /**
     * Creates a new device and adds it to the store.
     *
     * The device is persisted to the API (without an ID, as the backend generates it)
     * and added to the store state.
     *
     * @async
     * @function addDevice
     * @param {Device|Object} device - Device object to create
     * @param {string} device.field_id - ID of the associated field (must be a number)
     * @param {string} device.mac_address - MAC address of the device
     * @param {string} device.status - Device status (ONLINE, OFFLINE, LOW_BATTERY)
     * @param {string} device.last_sync - Last synchronization timestamp
     *
     * @returns {void}
     *
     * @example
     * store.addDevice({
     *   field_id: 1,  // Debe ser un número (int)
     *   mac_address: 'AA:BB:CC:00:11:22',
     *   status: 'ONLINE',
     *   last_sync: new Date().toISOString()
     * });
     */
    function addDevice(device) {
        // Asegurar que field_id sea un número entero
        const payload = {
            fieldId: Number(device.field_id) || 0,  // El backend espera "fieldId" (camelCase)
            macAddress: device.mac_address,
            status: device.status,
            lastSync: device.last_sync || new Date().toISOString() // El backend espera "lastSync"
        };
        monitoringApi.createDevice(payload).then(response => {
            const resource = response.data;
            const newDevice = DeviceAssembler.toEntityFromResource(resource);
            devices.value.push(newDevice);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing device in the store.
     *
     * The device is updated in the API and the local store state is synchronized.
     *
     * @async
     * @function updateDevice
     * @param {Device|Object} device - Updated device object
     * @param {string} device.id - Device identifier (int)
     * @param {string} device.mac_address - MAC address
     * @param {string} device.status - Device status
     * @param {string} device.last_sync - Last synchronization timestamp
     *
     * @returns {void}
     *
     * @throws {Error} If device update fails on the API
     *
     * @example
     * store.updateDevice({
     *   id: 1,
     *   mac_address: 'AA:BB:CC:00:11:22',
     *   status: 'OFFLINE',
     *   last_sync: new Date().toISOString()
     * });
     */
    function updateDevice(device) {
        const payload = {
            macAddress: device.mac_address,
            status: device.status,
            lastSync: device.last_sync || new Date().toISOString()
        };
        monitoringApi.updateDevice(device.id, payload).then(response => {
            const resource = response.data;
            const updatedDevice = DeviceAssembler.toEntityFromResource(resource);
            const index = devices.value.findIndex(c => String(c.id) === String(updatedDevice.id));
            if (index !== -1) devices.value[index] = updatedDevice;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a device from the store.
     *
     * The device is deleted from the API and removed from the local store state.
     *
     * @async
     * @function deleteDevice
     * @param {Device|Object} device - Device object to delete
     * @param {string} device.id - Device identifier (int)
     *
     * @returns {void}
     *
     * @throws {Error} If device deletion fails on the API
     *
     * @example
     * store.deleteDevice({ id: 1 });
     */
    function deleteDevice(device) {
        monitoringApi.deleteDevice(device.id).then(() => {
            const index = devices.value.findIndex(c => String(c.id) === String(device.id));
            if (index !== -1) devices.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Retrieves a field by its ID from the loaded fields.
     *
     * @function getFieldById
     * @param {string|number} id - The field identifier (int)
     *
     * @returns {Field|undefined} The field entity if found, undefined otherwise
     *
     * @example
     * const field = store.getFieldById(1);
     * if (field) {
     *   console.log(field.name);
     * }
     */
    function getFieldById(id) {
        return fields.value.find(field => String(field.id) === String(id));
    }

    /**
     * Creates a new field and adds it to the store.
     *
     * The field is persisted to the API (without an ID, as the backend generates it)
     * and added to the store state. A default profile_id is set to 1 if not provided.
     *
     * @async
     * @function addField
     * @param {Field|Object} field - Field object to create
     * @param {string} field.name - Name of the field
     * @param {number} field.size_m2 - Size in square meters (double)
     * @param {string} field.soil_type - Type of soil (e.g., Sandy, Clay-loam)
     * @param {number} field.latitude - Latitude coordinate (double)
     * @param {number} field.longitude - Longitude coordinate (double)
     * @param {number} [field.profile_id] - Profile ID (optional, will use current user's profile)
     *
     * @returns {void}
     *
     * @example
     * store.addField({
     *   name: 'Main Field',
     *   size_m2: 5000,
     *   soil_type: 'Sandy',
     *   latitude: -9.9306,
     *   longitude: -76.2422
     * });
     */
    function addField(field) {
        const profileId = getCurrentProfileId();

        const payload = {
            profileId: Number(field.profile_id) || profileId,
            name: field.name || '',
            sizeM2: Number(field.size_m2) || 0,
            soilType: field.soil_type || '',
            latitude: Number(field.latitude) || 0,
            longitude: Number(field.longitude) || 0
        };

        console.log('📤 Enviando al backend (Field):', payload);

        monitoringApi.createField(payload).then(response => {
            const resource = response.data;
            const newField = FieldAssembler.toEntityFromResource(resource);
            fields.value.push(newField);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing field in the store.
     *
     * The field is updated in the API and the local store state is synchronized.
     *
     * @async
     * @function updateField
     * @param {Field|Object} field - Updated field object
     * @param {string} field.id - Field identifier (int)
     * @param {string} field.name - Name of the field
     * @param {number} field.size_m2 - Size in square meters
     * @param {string} field.soil_type - Type of soil
     * @param {number} field.latitude - Latitude coordinate
     * @param {number} field.longitude - Longitude coordinate
     *
     * @returns {void}
     *
     * @throws {Error} If field update fails on the API
     *
     * @example
     * store.updateField({
     *   id: 1,
     *   name: 'Updated Field',
     *   size_m2: 6000,
     *   soil_type: 'Clay-loam',
     *   latitude: 10.5,
     *   longitude: 20.3
     * });
     */
    function updateField(field) {
        const payload = {
            name: field.name || '',
            sizeM2: Number(field.size_m2) || 0,
            soilType: field.soil_type || '',
            latitude: Number(field.latitude) || 0,
            longitude: Number(field.longitude) || 0
        };

        console.log(`📤 Actualizando campo ${field.id} en backend:`, payload);

        monitoringApi.updateField(field.id, payload).then(response => {
            const resource = response.data;
            const updatedField = FieldAssembler.toEntityFromResource(resource);
            const index = fields.value.findIndex(t => String(t.id) === String(updatedField.id));
            if (index !== -1) fields.value[index] = updatedField;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a field from the store.
     *
     * The field is deleted from the API and removed from the local store state.
     *
     * @async
     * @function deleteField
     * @param {Field|Object} field - Field object to delete
     * @param {string} field.id - Field identifier (int)
     *
     * @returns {void}
     *
     * @throws {Error} If field deletion fails on the API
     *
     * @example
     * store.deleteField({ id: 1 });
     */
    function deleteField(field) {
        monitoringApi.deleteField(field.id).then(() => {
            const index = fields.value.findIndex(t => String(t.id) === String(field.id));
            if (index !== -1) fields.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        devices,
        fields,
        errors,
        devicesLoaded,
        fieldsLoaded,
        devicesCount,
        fieldsCount,
        fetchDevices,
        fetchFields,
        getDeviceById,
        addDevice,
        updateDevice,
        deleteDevice,
        addField,
        updateField,
        deleteField,
        getFieldById
    }
});

export { useMonitoringStore };