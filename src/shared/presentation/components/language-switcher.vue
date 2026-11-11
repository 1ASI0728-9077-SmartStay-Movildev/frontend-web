<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
const { locale, availableLocales } = useI18n();

const locales = computed(() => availableLocales.map((item) => item.toUpperCase()));

const selectLocale = (nextLocale) => {
  locale.value = nextLocale.toLowerCase();
};
</script>

<template>
  <div class="language-switcher" role="group" :aria-label="'Language switcher'">
    <template v-for="(item, index) in locales" :key="item">
      <button
          class="language-switcher__button"
          :class="{ 'is-active': locale.toUpperCase() === item }"
          type="button"
          @click="selectLocale(item)"
      >
        {{ item }}
      </button>
      <span v-if="index < locales.length - 1" class="language-switcher__separator"></span>
    </template>
  </div>
</template>

<style scoped>

.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 2rem;
}

.language-switcher__button {
  padding: 0.4rem 0.9rem;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 1.5rem;
  transition: all 0.2s ease;
}

.language-switcher__button:hover {
  color: #1e293b;
}

.language-switcher__button.is-active {
  background-color: #ffffff;
  color: #00BB31;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.language-switcher__separator {
  display: none;
}

</style>