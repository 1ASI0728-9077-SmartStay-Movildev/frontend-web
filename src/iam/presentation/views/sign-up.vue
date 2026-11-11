<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const passwordError = ref(false);

function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    passwordError.value = true;
    return;
  }
  passwordError.value = false;
  emit('submit', {
    email: email.value,
    password: password.value
  });
}
</script>

<template>
  <!--TODO: Translate later-->
  <div class="auth-card">
    <h2>Sign up</h2>
    <p class="subtitle">Join the monitoring platform and optimize your crops</p>

    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label for="reg-email">Email Address</label>
        <input
            id="reg-email"
            type="email"
            v-model="email"
            placeholder="example@address.com"
            required
        />
      </div>

      <div class="form-group">
        <label for="reg-password">Password</label>
        <input
            id="reg-password"
            type="password"
            v-model="password"
            placeholder="Minimum 6 characters"
            minlength="6"
            required
        />
      </div>

      <div class="form-group">
        <label for="reg-confirm-password">Confirm Password</label>
        <input
            id="reg-confirm-password"
            type="password"
            v-model="confirmPassword"
            placeholder="Repeat password"
            required
        />
        <span v-if="passwordError" class="error-msg">The passwords don't match.</span>
      </div>

      <button type="submit" class="button-primary">Register</button>
    </form>

    <p class="switch-text">
      Do you have an account?
      <router-link :to="{ name: 'login' }">Sign in here</router-link>
    </p>
  </div>
</template>

<style scoped>

</style>