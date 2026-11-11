<script setup>import { useI18n } from 'vue-i18n'; const { t } = useI18n();</script>
<template><main class="auth-page"><h1>{{ t('errors.notFound') }}</h1><router-link to="/home">{{ t('nav.home') }}</router-link></main></template>
