<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { IamApi } from '../../infrastructure/iam-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import { useFormat } from '../../../shared/application/use-format.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), api = new IamApi(), id = ref('');
const { data, loading, error, run } = useRequest(), { status } = useFormat();
function load() { if (!loading.value) run(async () => {
  if (!id.value) return api.getUsers();
  const response = await api.getUser(id.value); return { data: [response.data] };
}); }
onMounted(load);
</script>
<template><section><h1>{{ t('nav.users') }}</h1><form class="card inline-form" @submit.prevent="load"><label for="user-id">{{ t('fields.userId') }}</label><input id="user-id" v-model="id" type="number" min="1" /><button :disabled="loading">{{ t('common.search') }}</button></form>
  <request-state :loading="loading" :error="error" :empty="data?.length === 0" />
  <div v-if="!loading && !error" class="cards"><article v-for="user in data" :key="user.id" class="card"><h2>{{ user.username }}</h2><p>{{ t('fields.userId') }}: {{ user.id }}</p><p>{{ t('roles.' + user.role) }} · {{ status(user.status) }}</p><p>{{ t('fields.hotelId') }}: {{ user.hotelId ?? '—' }}</p><p>{{ t('fields.chainId') }}: {{ user.chainId ?? '—' }}</p></article></div>
</section></template>
