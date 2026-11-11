import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class ProfilesApi extends BaseApi {
  mine(userId) { return this.http.get('/profiles/user/' + userId); }
  detail(id) { return this.http.get('/profiles/' + id); }
  all() { return this.http.get('/profiles'); }
  create(body) { return this.http.post('/profiles', body); }
}
