<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import useIamStore from '../../../iam/application/iam.store.js';
import { navigation, canUse } from '../../domain/permissions.js';
const { t } = useI18n(), store = useIamStore();
const items = computed(() => navigation.filter(item => item.name !== 'home' && canUse(store.session?.role, item.roles)));
</script>
<template>
  <section><h1>{{ t('home.welcome', { name: store.currentUsername }) }}</h1><p>{{ t('home.description') }}</p>
    <p v-if="store.session?.role === 'admin' && !store.session.hotelId" class="notice">{{ t('home.noScope') }}</p>
    <div class="cards"><router-link v-for="item in items" :key="item.name" :to="item.path" class="card nav-card">
      <span v-if="['explore','concierge'].includes(item.name)" class="tech-badge">{{ item.name === 'explore' ? '3D / 360°' : 'IA / AI' }}</span><i v-else :class="['pi', item.icon]" aria-hidden="true" /><h2>{{ t('nav.' + item.name) }}</h2><span>{{ t('common.open') }} →</span>
    </router-link></div>
  </section>
</template>
