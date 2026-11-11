<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import useIamStore from "../../application/iam.store.js"; // Importación corregida por defecto
import { SignInCommand } from "../../domain/sign-in.command.js";
import { SignUpCommand } from "../../domain/sign-up.command.js";

const route = useRoute();
const router = useRouter();
const iamStore = useIamStore();

const feedbackMessage = ref('');
const isError = ref(false);

const isLoginView = computed(() => route.name === 'login');

function clearFeedback() {
  feedbackMessage.value = '';
  isError.value = false;
}

// Adaptado para usar Command + Store de Arquitectura Limpia
async function handleLogin({ email, password }) {
  clearFeedback();

  // 1. Instanciamos el comando de Dominio
  const signInCommand = new SignInCommand({
    emailAddress: email,
    password: password
  });

  try {
    // 2. Ejecutamos la acción del store. Las redirecciones a 'home' o 'login'
    // en caso de fallo ya se manejan internamente dentro del store.
    await iamStore.signIn(signInCommand, router);

    // Si el store detecta errores tras la ejecución, actualizamos el banner local
    if (iamStore.errors.length > 0) {
      feedbackMessage.value = 'Sign-in failed. Please check your credentials.';
      isError.value = true;
    }
  } catch (error) {
    feedbackMessage.value = 'An unexpected error occurred during sign-in.';
    isError.value = true;
  }
}

// Adaptado para usar Command + Store de Arquitectura Limpia
async function handleRegister({ email, password }) {
  clearFeedback();

  // 1. Instanciamos el comando de Dominio para el registro
  const signUpCommand = new SignUpCommand({
    emailAddress: email,
    password: password
  });

  try {
    // 2. Ejecutamos la acción del store. Las redirecciones se manejan dentro de él.
    await iamStore.signUp(signUpCommand, router);

    if (iamStore.errors.length > 0) {
      feedbackMessage.value = 'Sign-up failed. The user might already exist.';
      isError.value = true;
    } else {
      feedbackMessage.value = 'Registration successful! Redirecting...';
      isError.value = false;
    }
  } catch (error) {
    feedbackMessage.value = 'An unexpected error occurred during registration.';
    isError.value = true;
  }
}
</script>

<template>
  <div class="auth-layout">
    <div class="auth-branding-panel">
      <div class="branding-content">
        <h1 class="logo-title">TerraTech</h1>
        <p class="tagline">Climate resilience and smart soil monitoring at your fingertips.</p>
      </div>
    </div>

    <div class="auth-form-panel">
      <div
          v-if="feedbackMessage"
          :class="['alert-banner', isError ? 'alert-danger' : 'alert-success']"
      >
        {{ feedbackMessage }}
      </div>

      <div class="form-container">
        <router-view v-slot="{ Component }">
          <component
              :is="Component"
              @submit="isLoginView ? handleLogin($event) : handleRegister($event)"
          />
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* TODO TU CSS ORIGINAL SE MANTIENE 100% IGUAL, SIN ALTERACIONES */
.auth-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
}

.auth-branding-panel {
  flex: 1;
  background: linear-gradient(135deg, #1b4d3e 0%, #2e7d32 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

@media (max-width: 768px) {
  .auth-branding-panel { display: none; }
}

.auth-form-panel {
  width: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #f9fbf9;
  position: relative;
}

@media (max-width: 768px) {
  .auth-form-panel { width: 100%; }
}

:deep(.auth-card) {
  width: 100%;
  max-width: 380px;
}

:deep(.auth-form) {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1.5rem;
}

:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

:deep(input) {
  padding: 0.75rem;
  border: 1px solid #cccccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

:deep(.button-primary) {
  background-color: #2e7d32;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

:deep(.button-primary:hover) {
  background-color: #1b4d3e;
}

.alert-banner {
  position: absolute;
  top: 2rem;
  left: 2rem;
  right: 2rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}
.alert-danger { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
.alert-success { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
</style>