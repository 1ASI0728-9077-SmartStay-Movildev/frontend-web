import axios from 'axios';
export function createHttpClient(origin, sessionAccess) {
  const url = new URL(origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password)
    throw new Error('VITE_MOVILDEV_API_URL must contain an HTTP(S) origin only.');
  const http = axios.create({ baseURL: url.origin + '/api/v1', timeout: 30000, withCredentials: false });
  http.interceptors.request.use(config => {
    const session = sessionAccess.current();
    config._sessionToken = session?.token;
    if (!config.public && !session) return Promise.reject({ response: { status: 401 } });
    if (!config.public && session) config.headers.Authorization = 'Bearer ' + session.token;
    if (config.data !== undefined) config.headers['Content-Type'] = 'application/json';
    return config;
  });
  http.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401 && !error.config?.public && error.config?._sessionToken)
      sessionAccess.expire(error.config._sessionToken);
    return Promise.reject(error);
  });
  return http;
}
