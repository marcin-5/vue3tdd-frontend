<script setup>
import LanguageSelector from '@/components/LanguageSelector.vue'
</script>

<template>
  <main class="container">
    <router-link data-testid="link-home-page" to="/">Home</router-link>
    <router-link data-testid="link-signup-page" to="/signup">{{ $t('signUp') }}</router-link>
    <LanguageSelector />
    <router-view />
  </main>
</template>
