<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LanguageSwitcher from './language-switcher.vue';
import useIamStore from '../../../iam/application/iam.store.js';
import { navigation, canUse } from '../../domain/permissions.js';
const { t } = useI18n(), store = useIamStore(), router = useRouter(), open = ref(false);
const items = computed(() => navigation.filter(item => {
  if (!store.isSignedIn) return ['catalog', 'concierge', 'explore'].includes(item.name);
  return canUse(store.session?.role, item.roles);
}));
function logout() { store.signOut(); router.replace({ name: 'login' }); }
</script>
<template>
  <div class="layout">
    <header class="topbar">
      <router-link class="brand" :to="store.isSignedIn ? '/home' : '/catalog'"><img src="/logo.png" alt="" />SmartStay</router-link>
      <div class="toolbar"><language-switcher />
        <span v-if="store.isSignedIn" class="identity">{{ store.currentUsername }} · {{ t('roles.' + store.session.role) }}</span>
        <button v-if="store.isSignedIn" class="secondary" @click="logout">{{ t('auth.logout') }}</button>
        <router-link v-else class="button" to="/auth/login">{{ t('nav.login') }}</router-link>
        <button class="mobile-toggle secondary" :aria-expanded="open" aria-controls="main-nav" @click="open = !open">{{ t('common.menu') }}</button>
      </div>
    </header>
    <div class="workspace">
      <nav id="main-nav" :class="['sidebar', { open }]" :aria-label="t('common.menu')">
        <router-link v-for="item in items" :key="item.name" :to="item.path" @click="open = false">
          <i :class="['pi', item.icon]" aria-hidden="true" />{{ t('nav.' + item.name) }}
        </router-link>
      </nav>
      <main id="main-content" class="content"><router-view :key="$route.fullPath" /></main>
    </div>
  </div>
</template>
