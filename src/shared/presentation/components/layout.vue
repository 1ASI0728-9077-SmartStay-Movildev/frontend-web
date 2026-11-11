<script setup>
import LanguageSwitcher from "./language-switcher.vue";
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import useIamStore from "../../../iam/application/iam.store.js";

const router = useRouter()
const route  = useRoute()
const { t }  = useI18n()

const drawer = ref(false);
const toggleDrawer = () => {
  drawer.value = !drawer.value;
}

const items = [
  { label: "nav.home", to: "/home", icon: "pi pi-home" },
  { label: "nav.inventory", to: "/stock/inventory", icon: "pi pi-box" },
  { label: "nav.monitoring", to: "/monitoring/fields", icon: "pi pi-map-marker" },
  { label: "nav.catalog", to: "/commercial/catalog", icon: "pi pi-shopping-cart" },
  { label: "nav.analytics", to: "/analytics/dashboard", icon: "pi pi-chart-line" },
  { label: "nav.settings", to: "/settings", icon: "pi pi-user" },
  { label: "nav.notifications", to: "/notifications", icon: "pi pi-bell" },
  { label: "nav.community", to: "/community", icon: "pi pi-users" }
];

const iamStore = useIamStore();

const handleSignOut = () => {
  iamStore.signOut();
  router.push({ path: "/auth/login" });
}
</script>

<template>
  <div class="layout">

    <!-- =====================================================
         SIDEBAR
    ====================================================== -->
    <aside class="sidebar">

      <!-- LOGO / BRAND -->
      <div class="sidebar-header">
        <router-link to="/home" class="logo-brand">
          <img
              src="/logo.png"
              alt="TerraTech"
              class="logo"
          />
        </router-link>

        <h2 class="brand-name">TerraTech</h2>
      </div>

      <!-- NAVIGATION -->
      <nav class="nav-menu">
        <router-link
            v-for="item in items"
            :key="item.label"
            :to="item.to"
            class="nav-item"
        >
          <i :class="item.icon" class="nav-icon"></i>

          <span class="nav-label">
            {{ t(item.label) }}
          </span>
        </router-link>
      </nav>
    </aside>

    <!-- =====================================================
         MAIN AREA
    ====================================================== -->
    <div class="main-area">

      <!-- TOPBAR -->
      <header class="topbar">

        <div class="topbar-left">
          <h1 class="page-title">
            {{ t('app.panel-title') }}
          </h1>
        </div>

        <div class="topbar-right">
          <language-switcher />
          <button class="logout-button" @click="handleSignOut" :title="t('nav.logout || Log Out')">
            <i class="pi pi-sign-out logout-icon"></i>
            <span class="logout-label">Log out</span>
          </button>
        </div>

      </header>
      <!-- =====================================================
           PAGE CONTENT
      ====================================================== -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>

  <pv-confirm-dialog />
</template>

<style scoped>
:root {
  --color-primary: #1A2B4C;
  --color-success: #00BB31;
  --color-white: #FFFFFF;
  --color-border: #E0E0E0;
  --color-light: #F5F7FA;
}

/* =========================================================
   GLOBAL LAYOUT
========================================================= */
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-light);
}

/* =========================================================
   SIDEBAR
========================================================= */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;

  width: 240px;
  height: 100vh;

  display: flex;
  flex-direction: column;

  background: var(--color-white);
  color: var(--color-primary);

  padding: 1.5rem 1rem;

  border-right: 1px solid var(--color-border);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);

  flex-shrink: 0;
}

/* =========================================================
   SIDEBAR HEADER
========================================================= */
.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.logo-brand {
  text-decoration: none;
  margin-bottom: 0.75rem;
}

.logo {
  width: 55px;
  height: 55px;
  object-fit: cover;
}

.brand-name {
  margin: 0;

  font-size: 1.15rem;
  font-weight: 600;

  color: var(--color-primary);
}

/* =========================================================
   NAVIGATION MENU
========================================================= */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  padding: 0.8rem 1rem;

  border-radius: 8px;

  color: var(--color-primary);
  text-decoration: none;

  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(0, 187, 49, 0.08);
}

.nav-item.router-link-active {
  background: rgba(0, 187, 49, 0.12);
  font-weight: 600;
}

.nav-icon {
  width: 22px;
  text-align: center;
  font-size: 1.1rem;
}

.nav-label {
  flex: 1;
}

/* =========================================================
   MAIN AREA
========================================================= */
.main-area {
  flex: 1;

  margin-left: 240px;

  display: flex;
  flex-direction: column;

  min-height: 100vh;
}

/* =========================================================
   TOPBAR
========================================================= */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  padding: 1.25rem 2rem;

  background: var(--color-white);

  border-bottom: 1px solid var(--color-border);

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;

  color: var(--color-primary);

  font-size: 1.4rem;
  font-weight: 600;
}

/* =========================================================
   ROUTER VIEW CONTENT
========================================================= */
.content {
  flex: 1;
  padding: 2.5rem 3rem;
}
/* =========================================================
   LOG OUT
========================================================= */
.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.logout-icon {
  font-size: 1rem;
}

.content {
  flex: 1;
  padding: 2.5rem 3rem;
}
/* =========================================================
   RESPONSIVE - TABLET
========================================================= */
@media (max-width: 768px) {

  .sidebar {
    width: 200px;
  }
  .main-area {
    margin-left: 200px;
  }
  .content {
    padding: 2rem;
  }
  .topbar {
    padding: 1rem 1.5rem;
  }
}

/* =========================================================
   RESPONSIVE - MOBILE
========================================================= */
@media (max-width: 600px) {
  .sidebar { width: 70px; }
  .main-area { margin-left: 70px; }
  .brand-name, .nav-label, .logout-label {
    display: none;
  }
  .logout-button {
    padding: 0.5rem;
  }
  .nav-item { justify-content: center; padding: 0.8rem 0; }
  .nav-icon { width: auto; font-size: 1.2rem; }
  .sidebar-header { padding-bottom: 1.5rem; }
  .content { padding: 1.25rem; }
  .page-title { font-size: 1rem; }
}
</style>
