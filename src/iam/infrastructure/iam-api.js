import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class IamApi extends BaseApi {
  signIn(command) { return this.http.post('/authentication/sign-in', command, { public: true }); }
  getUsers() { return this.http.get('/users'); }
  getUser(id) { return this.http.get('/users/' + id); }
}
