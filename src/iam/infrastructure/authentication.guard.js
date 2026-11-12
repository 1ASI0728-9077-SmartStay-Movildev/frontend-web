import useIamStore from '../application/iam.store.js';
import pinia from '../../pinia.js';
import { canUse } from '../../shared/domain/permissions.js';
export function authenticationGuard(to) {
  const store = useIamStore(pinia);
  store.ensureValid();
  if (!to.meta.public && !store.isSignedIn) return { name: 'login', query: { redirect: to.fullPath } };
  if (!canUse(store.session?.role, to.meta.roles)) return { name: 'forbidden' };
  if (to.name === 'login' && store.isSignedIn) return { name: 'home' };
  return true;
}
