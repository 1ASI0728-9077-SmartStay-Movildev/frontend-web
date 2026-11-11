import { ref, onScopeDispose } from 'vue';
import { normalizeApiError } from '../infrastructure/api-error.js';
// Scoped requests discard late responses after a route or identity changes.
export function useRequest() {
  const data = ref(null), error = ref(null), loading = ref(false);
  let sequence = 0, disposed = false;
  onScopeDispose(() => { disposed = true; sequence++; data.value = null; });
  async function run(action) {
    const request = ++sequence;
    loading.value = true; error.value = null;
    try {
      const response = await action();
      if (disposed || request !== sequence) return null;
      data.value = response.data;
      return response.data;
    } catch (failure) {
      if (!disposed && request === sequence) error.value = normalizeApiError(failure);
      return null;
    } finally { if (!disposed && request === sequence) loading.value = false; }
  }
  return { data, error, loading, run };
}
