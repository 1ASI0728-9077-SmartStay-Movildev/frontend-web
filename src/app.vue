<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from './iam/application/iam.store.js';
import { SESSION_KEY } from './shared/domain/session.js';
const store = useIamStore(), route = useRoute(), router = useRouter();
const { locale, t } = useI18n();
watch([locale, () => route.meta.title], () => {
  document.documentElement.lang = locale.value;
  document.title = 'SmartStay · ' + t('nav.' + (route.meta.title || 'home'));
  try { localStorage.setItem('smartstay.locale', locale.value); } catch { /* Preference stays in memory. */ }
}, { immediate: true });
watch(() => store.revision, () => {
  if (!store.isSignedIn && !route.meta.public) router.replace({ name: 'login' });
  else if (store.isSignedIn && route.name === 'login') router.replace({ name: 'home' });
});
const check = () => store.ensureValid();
const storage = event => { if (event.key === SESSION_KEY || event.key === null) { store.syncSession(); router.replace({ name: store.isSignedIn ? 'home' : 'login' }); } };
onMounted(() => { window.addEventListener('focus', check); document.addEventListener('visibilitychange', check); window.addEventListener('storage', storage); });
onUnmounted(() => { window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check); window.removeEventListener('storage', storage); });
</script>
<template><router-view :key="store.revision" /></template>
