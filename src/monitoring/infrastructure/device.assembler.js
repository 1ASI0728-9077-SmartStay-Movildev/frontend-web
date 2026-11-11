import { Device } from "../domain/model/device.entity.js";

/**
 * Assembler for converting API resources into Device entities.
 *
 * This design pattern (Assembler) handles the transformation of data coming
 * from the API into domain objects (Device), decoupling the infrastructure
 * layer from the domain layer.
 *
 * @class DeviceAssembler
 * @example
 * // Convert an individual resource
 * const deviceData = { id: 'dev_001', mac_address: 'AA:BB:CC:00:11:22', ... };
 * const device = DeviceAssembler.toEntityFromResource(deviceData);
 *
 * // Convert an API response
 * const response = await fetch('/api/devices');
 * const devices = DeviceAssembler.toEntitiesFromResponse(response);
 */
export class DeviceAssembler {

    /**
     * Maps resource to Device entity using snake_case and camelCase fallback.
     * @param {Object} resource - Device resource payload.
     * @param {string} resource.id - Device identifier.
     * @param {string} resource.mac_address - MAC address.
     * @param {string} resource.status - Device status.
     * @param {string} resource.last_sync - Last synchronization timestamp.
     * @returns {Device} Device instance.
     */
    static toEntityFromResource(resource) {
        return new Device({
            id: resource.id || '',
            field_id: resource.field_id || resource.fieldId || 0,
            mac_address: resource.mac_address || resource.macAddress || '',
            status: resource.status || '',
            last_sync: resource.last_sync || resource.lastSync || ''
        });
    }

    /**
     * Parses device resources from a response.
     * @param {Object} response - HTTP response.
     * @returns {Device[]} Device entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['devices'];
        if (!resources || !Array.isArray(resources)) return [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
