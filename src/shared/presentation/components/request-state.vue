<script setup>
import { useI18n } from 'vue-i18n';
defineProps({ loading: Boolean, error: Object, empty: Boolean });
const { t } = useI18n();
</script>
<template>
  <p v-if="loading" role="status" class="notice">{{ t('common.loading') }}</p>
  <div v-else-if="error && !error.cancelled" role="alert" class="notice error">
    <strong>{{ t('errors.' + error.code) }}</strong>
    <p v-if="error.detail">{{ error.detail }}</p>
  </div>
  <p v-else-if="empty" role="status" class="notice">{{ t('common.empty') }}</p>
</template>
