import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class PaymentsApi extends BaseApi {
  forBooking(id) { return this.http.get('/payments/booking/' + id); }
  create(body, key) { return this.http.post('/payments', body, { headers: { 'Idempotency-Key': key } }); }
}
