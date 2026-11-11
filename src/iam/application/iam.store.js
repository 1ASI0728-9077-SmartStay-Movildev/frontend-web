import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { IamApi } from '../infrastructure/iam-api.js';
import { SignInAssembler } from '../infrastructure/sign-in.assembler.js';
import { SESSION_KEY, restoreSession, validSession, tokenExpiry } from '../../shared/domain/session.js';
import { normalizeApiError } from '../../shared/infrastructure/api-error.js';

export default defineStore('iam', () => {
  const session = ref(restoreSession(localStorage));
  const loading = ref(false);
  const error = ref(null);
  const reason = ref('');
  const revision = ref(0);
  let timer;
  let attempt = 0;
  try { localStorage.removeItem('token'); } catch { /* Legacy token has no identity metadata. */ }
  const isSignedIn = computed(() => !!session.value);
  const currentToken = computed(() => session.value?.token || null);
  const currentUsername = computed(() => session.value?.username || '');
  const currentUserId = computed(() => session.value?.id || 0);
  function schedule() {
    clearTimeout(timer);
    if (session.value) timer = setTimeout(() => {
      ensureValid(); schedule();
    }, Math.min(Math.max(tokenExpiry(session.value.token) - Date.now(), 1), 2147483647));
  }
  function signOut(why = '') {
    attempt++;
    clearTimeout(timer);
    session.value = null;
    revision.value++;
    reason.value = why;
    error.value = null;
    loading.value = false;
    try { localStorage.removeItem(SESSION_KEY); } catch { /* Local state is still cleared. */ }
  }
  function ensureValid() {
    if (session.value && !validSession(session.value)) signOut('expired');
    return !!session.value;
  }
  async function signIn(command) {
    if (loading.value) return false;
    loading.value = true; error.value = null; reason.value = '';
    const request = ++attempt;
    try {
      const response = await new IamApi().signIn(command);
      if (request !== attempt) return false;
      const value = SignInAssembler.toResourceFromResponse(response);
      if (!validSession(value)) throw new Error('Invalid authentication response');
      session.value = value;
      revision.value++;
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch { /* Session remains in memory. */ }
      schedule();
      return true;
    } catch (failure) {
      if (request === attempt) error.value = normalizeApiError(failure);
      return false;
    } finally { if (request === attempt) loading.value = false; }
  }
  function syncSession() {
    session.value = restoreSession(localStorage);
    revision.value++;
    schedule();
  }
  schedule();
  return { session, loading, error, reason, revision, isSignedIn, currentToken, currentUsername,
    currentUserId, signIn, signOut, ensureValid, syncSession };
});
