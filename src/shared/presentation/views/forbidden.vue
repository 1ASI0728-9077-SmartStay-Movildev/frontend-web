<script setup>import { useI18n } from 'vue-i18n'; const { t } = useI18n();</script>
<template><h1>{{ t('errors.forbidden') }}</h1><router-link to="/home">{{ t('nav.home') }}</router-link></template>
