/**
 * Infrastructure resource returned by the authentication endpoint.
 *
 * @class SignInResource
 */
export class SignInResource {
    /**
     * @param {Object} params - Resource payload.
     * @param {string|number} params.id - Authenticated user identifier.
     * @param {string} params.emailAddress - Authenticated username.
     * @param {string} params.token - Bearer token.
     */
    constructor({id, emailAddress, token}) {
        this.id = id;
        this.emailAddress = emailAddress;
        this.token = token;
    }
}