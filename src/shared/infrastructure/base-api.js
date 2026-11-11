import axios from 'axios';
const platformApi = import.meta.env.VITE_MOVILDEV_API_URL;

/**
 * Shared infrastructure API client factory for bounded contexts.
 *
 * @class BaseApi
 */
export class BaseApi {
    #http;

    /**
     * Creates an Axios HTTP client configured for the platform API.
     */
    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        // Add the IAM interceptor to the HTTP client
        this.#http.interceptors.request.use(async (config) => {
            const { iamInterceptor } = await import("../../iam/infrastructure/iam.interceptor.js");
            return iamInterceptor(config);
        });
    }

    /**
     * Low-level HTTP client used by infrastructure endpoints.
     * @returns {import('axios').AxiosInstance} Axios client instance.
     */
    get http() { return this.#http;}
}