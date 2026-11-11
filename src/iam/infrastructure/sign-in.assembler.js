import {SignInResource} from "./sign-in.resource.js";

/**
 * Maps authentication endpoint responses into IAM infrastructure resources.
 *
 * @class SignInAssembler
 */
export class SignInAssembler {
    /**
     * @param {import('axios').AxiosResponse<Object>} response - HTTP response from sign-in endpoint.
     * @returns {SignInResource|null} Parsed resource when the response is successful; otherwise null.
     */
    static toResourceFromResponse(response) {
        console.log(response);
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return null;
        }
        return new SignInResource(response.data);
    }
}