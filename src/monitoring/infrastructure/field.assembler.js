import { Field } from "../domain/model/field.entity.js";

/**
 * Maps monitoring field resources into domain entities.
 *
 * @class FieldAssembler
 */
export class FieldAssembler {
    /**
     * Maps resource to Field entity using snake_case and camelCase fallback.
     * @param {Object} resource - Field resource payload.
     * @returns {Field} Field entity.
     */
    static toEntityFromResource(resource) {
        return new Field({
            id: resource.id || 0,
            profile_id: resource.profile_id || resource.profileId || 0,
            name: resource.name || '',
            size_m2: resource.size_m2 || resource.sizeM2 || 0,
            soil_type: resource.soil_type || resource.soilType || '',
            latitude: resource.latitude || 0,
            longitude: resource.longitude || 0,
        });
    }

    /**
     * Parses field resources from a response.
     * @param {Object} response - HTTP response.
     * @returns {Field[]} Field entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['fields'];
        if (!resources || !Array.isArray(resources)) return [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
