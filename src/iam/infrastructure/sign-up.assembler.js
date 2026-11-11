import {SignUpResource} from "./sign-up.resource.js";

/**
 * Maps registration endpoint responses into IAM infrastructure resources.
 *
 * @class SignUpAssembler
 */
export class SignUpAssembler {
    /**
     * @param {import('axios').AxiosResponse<Object>} response - HTTP response from sign-up endpoint.
     * @returns {SignUpResource|null} Parsed resource when the response is successful; otherwise null.
     */
    static toResourceFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return null;
        }
        const data = response.data || {};
        if (!data.message) {
            data.message = "User registered successfully";
        }
        return new SignUpResource(response.data);
    }
}