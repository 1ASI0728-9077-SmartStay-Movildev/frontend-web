import axios from 'axios';
const platformApi = import.meta.env.VITE_WEB_FRONTEND_API_URL;

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: { 'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'}
        });
    }

    get http() { return this.#http;}
}