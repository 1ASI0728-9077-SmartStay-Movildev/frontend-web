<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ProfilesApi } from '../../infrastructure/profiles-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), api = new ProfilesApi(), id = ref(''), kind = ref('profile');
const { data, loading, error, run } = useRequest();
function load() { if (!loading.value) run(async () => {
  if (!id.value) return api.all();
  const response = await (kind.value === 'user' ? api.mine(id.value) : api.detail(id.value));
  return { data: [response.data] };
}); }
onMounted(load);
</script>
<template><section><h1>{{ t('nav.profiles') }}</h1>
  <form class="card inline-form" @submit.prevent="load"><label for="profile-kind">{{ t('common.searchBy') }}</label><select id="profile-kind" v-model="kind"><option value="profile">{{ t('fields.profileId') }}</option><option value="user">{{ t('fields.userId') }}</option></select><label for="profile-id">ID</label><input id="profile-id" v-model="id" type="number" min="1" /><button :disabled="loading">{{ t('common.search') }}</button></form>
  <request-state :loading="loading" :error="error" :empty="data?.length === 0" />
  <div v-if="!loading && !error" class="cards"><article v-for="profile in data" :key="profile.id" class="card"><h2>{{ profile.fullName }}</h2><p>{{ t('fields.profileId') }}: {{ profile.id }} · {{ t('fields.userId') }}: {{ profile.userId ?? '—' }}</p><p>{{ profile.email }}</p><p>{{ profile.streetAddress }}</p></article></div>
</section></template>
