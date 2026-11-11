<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';
import { ProfilesApi } from '../../infrastructure/profiles-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), store = useIamStore(), api = new ProfilesApi();
const { data, loading, error, run } = useRequest();
const createMode = ref(false);
const form = reactive({ firstName: '', lastName: '', email: '', street: '', number: '', city: '', postalCode: '', country: '' });
async function load() { await run(() => api.mine(store.currentUserId)); createMode.value = error.value?.status === 404; }
async function create() { if (!loading.value) await run(() => api.create({ ...form, userId: store.currentUserId })); }
onMounted(load);
</script>
<template><section><div class="heading"><h1>{{ t('nav.profile') }}</h1><button :disabled="loading" @click="load">{{ t('common.refresh') }}</button></div>
  <request-state :loading="loading" :error="error?.status === 404 ? null : error" />
  <article v-if="data" class="card"><h2>{{ data.fullName }}</h2><p>{{ data.email }}</p><p>{{ data.streetAddress }}</p></article>
  <template v-if="error?.status === 404"><p class="notice">{{ t('profiles.missing') }}</p></template>
  <form v-if="!data && createMode" class="card form-grid" @submit.prevent="create">
    <div v-for="key in Object.keys(form)" :key="key"><label :for="key">{{ t('fields.' + key) }}</label><input :id="key" v-model="form[key]" :type="key === 'email' ? 'email' : 'text'" required :disabled="loading" /></div><button :disabled="loading">{{ t('common.create') }}</button>
  </form>
</section></template>
