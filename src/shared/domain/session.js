export const SESSION_KEY = 'smartstay.session';
export function tokenExpiry(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(part));
    return Number.isFinite(exp) ? exp * 1000 : 0;
  } catch { return 0; }
}
export function validSession(session, now = Date.now()) {
  return !!(session && Number.isInteger(session.id) && session.id > 0 &&
    typeof session.username === 'string' && typeof session.role === 'string' &&
    typeof session.token === 'string' && tokenExpiry(session.token) > now);
}
export function restoreSession(storage, now = Date.now()) {
  try {
    const session = JSON.parse(storage.getItem(SESSION_KEY));
    if (validSession(session, now)) return session;
  } catch { /* Invalid or unavailable storage is treated as anonymous. */ }
  try { storage.removeItem(SESSION_KEY); } catch { /* Storage may be disabled. */ }
  return null;
}
