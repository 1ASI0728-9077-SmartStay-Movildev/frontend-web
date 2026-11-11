import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class ConciergeApi extends BaseApi {
  send(body) { return this.http.post('/concierge/messages', body, { public: true }); }
}
