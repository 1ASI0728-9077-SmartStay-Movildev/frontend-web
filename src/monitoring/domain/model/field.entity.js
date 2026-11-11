/**
 * Represents an agricultural field.
 * @class Field
 * @property {number} id - Unique field identifier.
 * @property {number} profile_id - ID of the owning profile.
 * @property {string} name - Field name.
 * @property {number} size_m2 - Size in square meters.
 * @property {string} soil_type - Type of soil (e.g., 'Sandy', 'Clay-loam').
 * @property {number} latitude - Latitude coordinate.
 * @property {number} longitude - Longitude coordinate.
 */
export class Field {
    id;
    profile_id;
    name;
    size_m2;
    soil_type;
    latitude;
    longitude;

    /**
     * Creates a new Field instance.
     * @param {Object} params - Field parameters.
     * @param {number} [params.id=0] - Field ID.
     * @param {number} [params.profile_id=0] - Profile ID.
     * @param {string} [params.name=''] - Field name.
     * @param {number} [params.size_m2=0] - Size in square meters.
     * @param {string} [params.soil_type=''] - Soil type.
     * @param {number} [params.latitude=0] - Latitude.
     * @param {number} [params.longitude=0] - Longitude.
     */
    constructor({ id = 0, profile_id = 0, name = '', size_m2 = 0, soil_type = '', latitude = 0, longitude = 0 }) {
        this.id = id;
        this.profile_id = profile_id;
        this.name = name;
        this.size_m2 = size_m2;
        this.soil_type = soil_type;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}