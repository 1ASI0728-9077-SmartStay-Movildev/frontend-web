export function normalizeApiError(error) {
  const status = error?.response?.status || 0;
  const body = error?.response?.data;
  const text = value => typeof value === 'string' ? value.slice(0, 1000) : '';
  let detail = '';
  if (typeof body === 'string' && !/<[a-z!][\s\S]*>/i.test(body)) detail = text(body);
  else if (body && typeof body === 'object') {
    detail = text(body.message) || text(body.error) || text(body.detail) || text(body.title);
    if (body.errors && typeof body.errors === 'object') {
      const fields = Object.values(body.errors).flat().map(text).filter(Boolean).join(' ');
      if (fields) detail = fields;
    }
  }
  const codes = { 400: 'validation', 401: 'unauthorized', 403: 'forbidden', 404: 'notFound', 409: 'conflict', 429: 'rateLimit' };
  return { status, code: codes[status] || 'unavailable', detail: detail.slice(0, 1500),
    cancelled: error?.code === 'ERR_CANCELED',
    uncertain: !status || status >= 500 };
}
