<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit']);

const email = ref('');
const password = ref('');

function handleSubmit() {
  if (email.value.trim() && password.value.trim()) {
    emit('submit', {
      email: email.value,
      password: password.value,
    });
  }
}
</script>

<template>
  <!--TODO: Translate later-->
  <div class="auth-card">
    <h2>Sign In</h2>
    <p class="subtitle">Enter your credentials to access TerraTech</p>

    <form @submit.prevent="handleSubmit"  class="auth-form">
      <div class="form-group">
        <label for="login-email">Email Address</label>
        <input
            id="login-email"
            type="email"
            v-model="email"
            placeholder="example@address.com"
            required
        />
      </div>
      <div class="form-group">
        <label for="login-password">Password</label>
        <input
            id="login-password"
            type="password"
            v-model="password"
            placeholder="••••••••"
            required
        />
      </div>

      <button type="submit" class="button-primary">Login</button>

      <p class="switch-text">Don't have an account?
        <router-link :to="{ name: 'register' }">Sign up here.</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>

</style>