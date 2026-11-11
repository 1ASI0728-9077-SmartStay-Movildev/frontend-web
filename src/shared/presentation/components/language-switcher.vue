<script setup>
import { useI18n } from 'vue-i18n';
const { locale, t } = useI18n();
</script>
<template><div class="language-switcher" role="group" :aria-label="t('common.language')">
  <button v-for="item in ['es', 'en']" :key="item" type="button" class="secondary" :aria-pressed="locale === item" @click="locale = item">{{ item.toUpperCase() }}</button>
</div></template>
