<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ProfilesApi } from '../../infrastructure/profiles-api.js';
import { useRequest } from '../../../shared/application/use-request.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';

const { t } = useI18n();
const api = new ProfilesApi();
const id = ref('');
const kind = ref('profile');
const { data, loading, error, run } = useRequest();

function load() {
  if (!loading.value) run(async () => {
    if (!id.value) return api.all();
    const response = await (kind.value === 'user' ? api.mine(id.value) : api.detail(id.value));
    return { data: [response.data] };
  });
}

onMounted(load);
</script>

<template>
  <section class="admin-profiles-page">
    <div class="page-title-row">
      <h1 class="page-title">{{ t('nav.profiles') }}</h1>
      <router-link to="/users" class="btn-orange btn-sm">
        <i class="pi pi-users" aria-hidden="true" />
        {{ t('admin.guests') }} & {{ t('admin.staff') }}
      </router-link>
    </div>

    <form class="card inline-form" @submit.prevent="load">
      <label for="profile-kind">{{ t('common.searchBy') }}</label>
      <select id="profile-kind" v-model="kind">
        <option value="profile">{{ t('fields.profileId') }}</option>
        <option value="user">{{ t('fields.userId') }}</option>
      </select>
      <label for="profile-id">ID</label>
      <input id="profile-id" v-model="id" type="number" min="1" placeholder="Ej: 1" />
      <button class="secondary" :disabled="loading">{{ t('common.search') }}</button>
      <button type="button" class="secondary" :disabled="loading" @click="id = ''; load()">{{ t('common.refresh') }}</button>
    </form>

    <request-state :loading="loading" :error="error" :empty="data?.length === 0" />

    <div v-if="!loading && !error && data" class="table-responsive card no-padding">
      <table class="admin-table">
        <thead>
          <tr>
            <th>{{ t('fields.profileId') }}</th>
            <th>{{ t('admin.clientName') }}</th>
            <th>{{ t('fields.userId') }}</th>
            <th>{{ t('fields.email') }}</th>
            <th>{{ t('admin.address') }}</th>
            <th>{{ t('admin.phone') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="profile in data" :key="profile.id">
            <td><strong>#{{ profile.id }}</strong></td>
            <td>
              <div class="user-cell">
                <span class="user-avatar-circle guest-avatar">{{ (profile.fullName || 'P').slice(0, 2).toUpperCase() }}</span>
                <strong>{{ profile.fullName }}</strong>
              </div>
            </td>
            <td>{{ profile.userId ?? '—' }}</td>
            <td>{{ profile.email }}</td>
            <td>{{ profile.streetAddress }}</td>
            <td>{{ profile.phoneNumber || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
