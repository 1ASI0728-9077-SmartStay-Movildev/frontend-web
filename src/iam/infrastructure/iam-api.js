import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";
import {BaseApi} from "../../shared/infrastructure/base-api.js";
const signInEndpointPath = import.meta.env.VITE_SIGNIN_ENDPOINT_PATH;
const signUpEndpointPath = import.meta.env.VITE_SIGNUP_ENDPOINT_PATH;
const usersEndpointPath   = import.meta.env.VITE_USERS_ENDPOINT_PATH;

/**
 * Infrastructure gateway for IAM bounded-context endpoints.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
    #signInEndpoint;
    #signUpEndpoint;
    #usersEndpoint;

    /** Creates endpoint clients for sign-in, sign-up, and user listing. */
    constructor() {
        super();
        this.#signInEndpoint = new BaseEndpoint(this, signInEndpointPath);
        this.#signUpEndpoint = new BaseEndpoint(this, signUpEndpointPath);
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
    }

    /**
     * Sends a sign-in command to the authentication endpoint.
     * @param {import('../domain/sign-in.command.js').SignInCommand} signInRequest - Sign-in command.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with authentication payload.
     */
    signIn(signInRequest) {
        return this.#signInEndpoint.create(signInRequest);
    }

    /**
     * Sends a sign-up command to the registration endpoint.
     * @param {import('../domain/sign-up.command.js').SignUpCommand} signUpRequest - Sign-up command.
     * @returns {Promise<import('axios').AxiosResponse<Object>>} HTTP response with registration payload.
     */
    signUp(signUpRequest) {
        return this.#signUpEndpoint.create(signUpRequest);
    }

    /**
     * Retrieves users visible to the IAM context.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>|Object>>} HTTP response with user resources.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    /**
     * Retrieves user by email
     * @param emailAddress users email address.
     * @returns {Promise<import('axios').AxiosResponse<Array<Object>|Object>>} HTTP response with user resources.
     */
    findByEmail(emailAddress) {
        return this.#usersEndpoint.getByEmail(emailAddress);
    }
}