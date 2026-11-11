import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

const fieldsEndpointPath = import.meta.env.VITE_FIELDS_ENDPOINT_PATH;
const devicesEndpointPath = import.meta.env.VITE_DEVICES_ENDPOINT_PATH;

/**
 * API client for the monitoring module.
 *
 * This class provides methods to perform CRUD operations
 * (Create, Read, Update, Delete) on devices and crop fields
 * through a REST API.
 *
 * It extends BaseApi and uses BaseEndpoint
 * to handle routes generically.
 *
 * @class MonitoringApi
 * @extends BaseApi
 *
 * @example
 * const api = new MonitoringApi();
 * const devices = await api.getDevices();
 * const device = await api.getDeviceById('dev_001');
 * await api.createDevice({
 *   mac_address: 'AA:BB:CC:00:11:22',
 *   status: 'ONLINE'
 * });
 *
 * @property {BaseEndpoint} #fieldsEndpointPath
 * Private endpoint for crop field operations.
 *
 * @property {BaseEndpoint} #devicesEndpointPath
 * Private endpoint for device operations.
 */
export class MonitoringApi extends BaseApi {
    #fieldsEndpointPath;
    #devicesEndpointPath;

    /**
     * Creates a new instance of MonitoringApi.
     *
     * Initializes the endpoints for devices and crop fields
     * using the routes configured in the environment variables.
     *
     * @constructor
     */
    constructor() {
        super();
        this.#fieldsEndpointPath = new BaseEndpoint(this, fieldsEndpointPath);
        this.#devicesEndpointPath = new BaseEndpoint(this, devicesEndpointPath);
    }

    /**
     * Retrieves all crop fields.
     *
     * @async
     * @returns {Promise<import('axios').AxiosResponse<Field[]>>}
     * Response containing an array of crop fields.
     *
     * @example
     * try {
     *   const response = await api.getFields();
     *   console.log(response.data); // Array of fields
     * } catch (error) {
     *   console.error('Error:', error);
     * }
     */
    getFields() {
        return this.#fieldsEndpointPath.getAll();
    }

    /**
     * Retrieves a crop field by its identifier.
     *
     * @async
     * @param {string|number} id - Unique identifier of the crop field
     *
     * @returns {Promise<import('axios').AxiosResponse<Field>>}
     * Response containing the crop field.
     *
     * @throws {Error} If the field does not exist
     *
     * @example
     * const response = await api.getFieldById('field_001');
     * console.log(response.data); // Field object
     */
    getFieldById(id) {
        return this.#fieldsEndpointPath.getById(id);
    }

    /**
     * Creates a new crop field.
     *
     * @async
     * @param {Object} resource - Crop field data to create
     * @param {string} resource.name - Field name
     * @param {string} resource.size_m2 - Size in square meters
     * @param {string} resource.soil_type - Soil type
     * @param {string} resource.location_lat_long - Geographic location
     *
     * @returns {Promise<import('axios').AxiosResponse<Field>>}
     * Response containing the created field.
     *
     * @example
     * const newField = {
     *   name: 'Main Field',
     *   size_m2: '5000',
     *   soil_type: 'loamy',
     *   location_lat_long: '10.5°N, 20.3°W'
     * };
     *
     * const response = await api.createField(newField);
     */
    createField(resource) {
        return this.#fieldsEndpointPath.create(resource);
    }

    /**
     * Updates an existing crop field.
     *
     * @async
     * @param {string|number} id - Field identifier
     * @param {Object} resource - Crop field data to update
     * @param {string} resource.name - Field name
     * @param {string} resource.size_m2 - Size in square meters
     * @param {string} resource.soil_type - Soil type
     * @param {string} resource.location_lat_long - Geographic location
     *
     * @returns {Promise<import('axios').AxiosResponse<Field>>}
     * Response containing the updated field.
     *
     * @example
     * const updatedField = {
     *   id: 'field_001',
     *   name: 'Updated Field',
     *   ...
     * }
     *
     * const response = await api.updateField(updatedField);
     */
    updateField(id, resource) {
        return this.#fieldsEndpointPath.update(id, resource);
    }

    /**
     * Deletes a crop field.
     *
     * @async
     * @param {string|number} id - Identifier of the field to delete
     *
     * @returns {Promise<import('axios').AxiosResponse>}
     * Response of the delete operation.
     *
     * @throws {Error} If the field does not exist or an error occurs during deletion
     *
     * @example
     * await api.deleteField('field_001');
     * console.log('Field deleted');
     */
    deleteField(id) {
        return this.#fieldsEndpointPath.delete(id);
    }

    /**
     * Retrieves all devices.
     *
     * @async
     * @returns {Promise<import('axios').AxiosResponse<Device[]>>}
     * Response containing an array of devices.
     *
     * @example
     * try {
     *   const response = await api.getDevices();
     *   console.log(response.data); // Array of devices
     * } catch (error) {
     *   console.error('Error:', error);
     * }
     */
    getDevices() {
        return this.#devicesEndpointPath.getAll();
    }

    /**
     * Retrieves a device by its identifier.
     *
     * @async
     * @param {string|number} id - Unique identifier of the device
     *
     * @returns {Promise<import('axios').AxiosResponse<Device>>}
     * Response containing the device.
     *
     * @throws {Error} If the device does not exist
     *
     * @example
     * const response = await api.getDeviceById('dev_001');
     * console.log(response.data); // Device object
     */
    getDeviceById(id) {
        return this.#devicesEndpointPath.getById(id);
    }

    /**
     * Creates a new device.
     *
     * @async
     * @param {Object} resource - Device data to create
     * @param {string} resource.mac_address - Device MAC address
     * @param {string} resource.status - Device status
     * @param {string} resource.last_sync - Last synchronization date
     *
     * @returns {Promise<import('axios').AxiosResponse<Device>>}
     * Response containing the created device.
     *
     * @example
     * const newDevice = {
     *   mac_address: 'AA:BB:CC:00:11:22',
     *   status: 'ONLINE',
     *   last_sync: '2026-05-13T10:00:00Z'
     * };
     *
     * const response = await api.createDevice(newDevice);
     */
    createDevice(resource) {
        return this.#devicesEndpointPath.create(resource);
    }

    /**
     * Updates an existing device.
     *
     * @async
     * @param {string|number} id - Device identifier
     * @param {Object} resource - Device data to update
     * @param {string} resource.mac_address - MAC address
     * @param {string} resource.status - Device status
     * @param {string} resource.last_sync - Last synchronization date
     *
     * @returns {Promise<import('axios').AxiosResponse<Device>>}
     * Response containing the updated device.
     *
     * @example
     * const updatedDevice = {
     *   id: 'dev_001',
     *   mac_address: 'AA:BB:CC:00:11:22',
     *   status: 'OFFLINE',
     *   ...
     * };
     *
     * const response = await api.updateDevice(updatedDevice);
     */
    updateDevice(id, resource) {
        return this.#devicesEndpointPath.update(id, resource);
    }

    /**
     * Deletes a device.
     *
     * @async
     * @param {string|number} id - Identifier of the device to delete
     *
     * @returns {Promise<import('axios').AxiosResponse>}
     * Response of the delete operation.
     *
     * @throws {Error} If the device does not exist or an error occurs during deletion
     *
     * @example
     * await api.deleteDevice('dev_001');
     * console.log('Device deleted');
     */
    deleteDevice(id) {
        return this.#devicesEndpointPath.delete(id);
    }
}