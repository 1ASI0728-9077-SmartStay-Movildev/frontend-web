<script setup>

import LanguageSwitcher from "./language-switcher.vue";
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import FooterContent from "./footer-content.vue";
const { t } = useI18n();

const drawer = ref(false);
const toggleDrawer = () => {
  drawer.value = !drawer.value;
}
const items = [
  {label: 'option.home', to: '/home'},
  {label: 'option.new-shelves', to: '/storage/items/new'},
];
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <div class="header">
    <pv-toolbar class="bg-primary">
      <template #start>
        <pv-button class="p-button-text" icon="pi pi-bars" @click="toggleDrawer"/>
        <img src="/logo.png" alt="CLZ Games Logo" class="logo" />
        <h3>CLZ Games the best collectors</h3>
      </template>
      <template #center>
        <div class="flex-column mr-3">
          <pv-button v-for="item in items" :key="item.label" as-child v-slot="slotProps">
            <router-link :to="item.to" :class="slotProps['class']">{{ t(item.label) }}</router-link>
          </pv-button>
        </div>
      </template>
      <template #end>
        <language-switcher/>
      </template>
    </pv-toolbar>
    <pv-drawer v-model:visible="drawer"/>
  </div>
  <div class="main-content">
    <router-view/>
  </div>
  <div class="footer">
    <footer-content/>
  </div>
</template>

<style scoped>
.header {
  position: absolute;
  left: 0;
  top:0;
  width:100%;
}

.main-content {
  margin-top: 60px;
  margin-bottom: 100px;
}

.logo {
  width: 80px;
  height: 36px;
  margin-right: 14px;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;

}
</style>