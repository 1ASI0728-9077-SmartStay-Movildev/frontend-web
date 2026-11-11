import { BaseApi } from '../../shared/infrastructure/base-api.js';
export class AnalyticsApi extends BaseApi {
  monthly() { return this.http.get('/analytics/performance/monthly'); }
}
