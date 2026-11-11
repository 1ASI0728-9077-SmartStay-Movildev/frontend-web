import { createHttpClient } from './http-client.js';
import { validSession } from '../domain/session.js';
let http;
export class BaseApi {
  get http() {
    if (!http) http = createHttpClient(import.meta.env.VITE_MOVILDEV_API_URL, {
      current() {
        const store = sessionStore();
        store.ensureValid();
        return validSession(store.session) ? store.session : null;
      },
      expire(token) {
        const store = sessionStore();
        if (store.session?.token === token) store.signOut('expired');
      },
    });
    return http;
  }
}
import useIamStore from '../../iam/application/iam.store.js';
import pinia from '../../pinia.js';
const sessionStore = () => useIamStore(pinia);
