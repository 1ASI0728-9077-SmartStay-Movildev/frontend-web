<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useIamStore from '../../application/iam.store.js';
import { SignInCommand } from '../../domain/sign-in.command.js';
import RequestState from '../../../shared/presentation/components/request-state.vue';
const { t } = useI18n(), router = useRouter(), store = useIamStore();
const username = ref(''), password = ref(''), show = ref(false), invalid = ref(false);
async function submit() {
  invalid.value = !/^[a-zA-Z0-9_.@]{3,100}$/.test(username.value) || password.value.length < 6;
  if (invalid.value || store.loading) return;
  const command = new SignInCommand({ username: username.value, password: password.value });
  const success = await store.signIn(command);
  password.value = '';
  if (success) router.replace({ name: 'home' });
}
</script>
<template>
  <section class="card login-card"><h1>{{ t('nav.login') }}</h1><p>{{ t('auth.description') }}</p>
    <p v-if="store.reason === 'expired'" role="status" class="notice">{{ t('auth.expired') }}</p>
    <form @submit.prevent="submit">
      <label for="username">{{ t('fields.username') }}</label>
      <input id="username" v-model="username" autocomplete="username" required minlength="3" maxlength="100" pattern="[a-zA-Z0-9_.@]+" :disabled="store.loading" aria-describedby="username-help" />
      <small id="username-help">{{ t('auth.usernameHelp') }}</small>
      <label for="password">{{ t('fields.password') }}</label>
      <div class="password-row"><input id="password" v-model="password" :type="show ? 'text' : 'password'" autocomplete="current-password" required minlength="6" :disabled="store.loading" />
        <button type="button" class="secondary" :aria-pressed="show" @click="show = !show">{{ t(show ? 'auth.hide' : 'auth.show') }}</button></div>
      <p v-if="invalid" role="alert" class="notice error">{{ t('auth.invalid') }}</p>
      <p v-if="store.error?.status === 401" role="alert" class="notice error">{{ t('auth.badCredentials') }}</p>
      <request-state v-else :error="store.error" />
      <button type="submit" :disabled="store.loading">{{ t(store.loading ? 'common.loading' : 'nav.login') }}</button>
    </form>
    <div class="toolbar"><router-link to="/catalog">{{ t('nav.catalog') }}</router-link><router-link to="/concierge">{{ t('nav.concierge') }}</router-link></div>
  </section>
</template>
