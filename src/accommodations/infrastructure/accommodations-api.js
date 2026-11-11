import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class AccommodationsApi extends BaseApi {
  search(params) { return this.http.get('/rooms/search', { params, public: true }); }
  vr(id) { return this.http.get('/rooms/' + id + '/vr', { public: true }); }
  tour(id) { return this.http.get('/rooms/' + id + '/tour', { public: true }); }
  hotels() { return this.http.get('/hotels'); }
  rooms() { return this.http.get('/rooms'); }
  room(id) { return this.http.get('/rooms/' + id); }
  types() { return this.http.get('/room-types'); }
  categories() { return this.http.get('/accommodations/options/categories'); }
  amenities() { return this.http.get('/accommodations/options/amenities'); }
}
