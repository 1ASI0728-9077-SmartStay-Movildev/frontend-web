import {User} from "../domain/user.entity.js";

/**
 * Maps IAM infrastructure resources into domain entities.
 *
 * @class UserAssembler
 */
export class UserAssembler {
    /**
     * @param {Object} resource - User resource payload.
     * @returns {User} User entity.
     */
    static toEntityFromResource(resource) {
        return new User({...resource});
    }

    /**
     * @param {import('axios').AxiosResponse<Array<Object>|Object>} response - HTTP response containing user resources.
     * @returns {User[]} Collection of user entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['users'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}