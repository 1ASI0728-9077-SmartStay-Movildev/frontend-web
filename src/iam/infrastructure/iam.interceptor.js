import useIamStore from "../application/iam.store.js";

/**
 * Adds the IAM bearer token to outbound requests when a user is authenticated.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - Axios request configuration.
 * @returns {import('axios').InternalAxiosRequestConfig} Updated request configuration.
 */
export const iamInterceptor = (config) => {
    const store = useIamStore();
    const { isSignedIn, currentToken} = store;
    if (isSignedIn) {
        config.headers.Authorization = `Bearer ${currentToken}`;
        console.log(config);
    }
    return config;
}