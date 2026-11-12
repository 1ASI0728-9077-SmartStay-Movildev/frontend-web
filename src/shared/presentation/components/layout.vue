<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LanguageSwitcher from './language-switcher.vue';
import useIamStore from '../../../iam/application/iam.store.js';
import { navigation, canUse } from '../../domain/permissions.js';

const { t } = useI18n(), store = useIamStore(), router = useRouter(), open = ref(false);
const searchQuery = ref('');

const isAdmin = computed(() => ['admin', 'chain_admin'].includes(store.session?.role));

const items = computed(() => navigation.filter(item => {
  if (!store.isSignedIn) return ['catalog', 'concierge', 'explore'].includes(item.name);
  return canUse(store.session?.role, item.roles);
}));

const adminSections = computed(() => [
  {
    title: t('admin.dashboard'),
    items: items.value.filter(i => ['analytics', 'home'].includes(i.name))
  },
  {
    title: t('admin.management'),
    items: items.value.filter(i => ['users', 'profiles', 'accommodations', 'bookingAdmin'].includes(i.name))
  },
  {
    title: t('admin.operations'),
    items: items.value.filter(i => ['bookings', 'payments'].includes(i.name))
  },
  {
    title: t('admin.other'),
    items: items.value.filter(i => ['catalog', 'explore', 'concierge', 'profile'].includes(i.name))
  }
].filter(s => s.items.length > 0));

const userInitials = computed(() => {
  const name = store.currentUsername || '';
  return name.slice(0, 2).toUpperCase() || 'AD';
});

function logout() { store.signOut(); router.replace({ name: 'login' }); }
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <div class="topbar-left">
        <router-link class="brand" :to="store.isSignedIn ? '/home' : '/catalog'">
          <img src="/logo.png" alt="" />SmartStay
        </router-link>
        <div v-if="store.isSignedIn && isAdmin" class="topbar-search">
          <i class="pi pi-search" aria-hidden="true" />
          <input v-model="searchQuery" type="text" :placeholder="t('common.search') + '...'" aria-label="Global search" />
        </div>
      </div>
      <div class="toolbar">
        <language-switcher />
        <div v-if="store.isSignedIn" class="user-pill">
          <span class="avatar-badge" aria-hidden="true">{{ userInitials }}</span>
          <span class="identity">{{ store.currentUsername }} <small>({{ t('roles.' + store.session.role) }})</small></span>
        </div>
        <button v-if="store.isSignedIn" class="secondary" @click="logout">{{ t('auth.logout') }}</button>
        <router-link v-else class="button orange" to="/auth/login">{{ t('nav.login') }}</router-link>
        <button class="mobile-toggle secondary" :aria-expanded="open" aria-controls="main-nav" @click="open = !open">
          <i class="pi pi-bars" aria-hidden="true" />
          {{ t('common.menu') }}
        </button>
      </div>
    </header>
    <div class="workspace">
      <nav id="main-nav" :class="['sidebar', { open }]" :aria-label="t('common.menu')">
        <template v-if="isAdmin">
          <div v-for="section in adminSections" :key="section.title" class="sidebar-section">
            <div class="sidebar-section-title">{{ section.title }}</div>
            <router-link v-for="item in section.items" :key="item.name" :to="item.path" @click="open = false">
              <i :class="['pi', item.icon]" aria-hidden="true" />
              <span>{{ t('nav.' + item.name) }}</span>
            </router-link>
          </div>
        </template>
        <template v-else>
          <router-link v-for="item in items" :key="item.name" :to="item.path" @click="open = false">
            <i :class="['pi', item.icon]" aria-hidden="true" />
            <span>{{ t('nav.' + item.name) }}</span>
          </router-link>
        </template>
      </nav>
      <main id="main-content" class="content"><router-view :key="$route.fullPath" /></main>
    </div>
  </div>
</template>
