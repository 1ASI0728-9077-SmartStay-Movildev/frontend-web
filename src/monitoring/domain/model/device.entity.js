/**
 * Represents an IoT monitoring device.
 * @class Device
 * @property {number} id - Unique device identifier.
 * @property {number} field_id - ID of the associated field.
 * @property {string} mac_address - MAC address of the device.
 * @property {string} status - Current status: 'ONLINE', 'OFFLINE', or 'LOW_BATTERY'.
 * @property {string} last_sync - Timestamp of the last synchronization.
 */
export class Device {
    id;
    field_id;
    mac_address;
    status;
    last_sync;

    /**
     * Creates a new Device instance.
     * @param {Object} params - Device parameters.
     * @param {number} [params.id=0] - Device ID.
     * @param {number} [params.field_id=0] - Associated field ID.
     * @param {string} [params.mac_address=''] - MAC address.
     * @param {string} [params.status=''] - Device status.
     * @param {string} [params.last_sync=''] - Last synchronization timestamp.
     */
    constructor({ id = 0, field_id = 0, mac_address = '', status = '', last_sync = '' }) {
        this.id = id;
        this.field_id = field_id;
        this.mac_address = mac_address;
        this.status = status;
        this.last_sync = last_sync;
    }
}