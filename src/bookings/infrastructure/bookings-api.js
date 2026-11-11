import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class BookingsApi extends BaseApi {
  mine() { return this.http.get('/bookings/mine'); }
  all() { return this.http.get('/bookings'); }
  room(id) { return this.http.get('/bookings/room/' + id); }
  detail(id) { return this.http.get('/bookings/' + id); }
  create(body) { return this.http.post('/bookings', body); }
  cancel(id) { return this.http.post('/bookings/' + id + '/cancel'); }
  confirm(id) { return this.http.post('/bookings/' + id + '/confirm'); }
}
