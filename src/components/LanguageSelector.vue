<template>
  <img
    src="https://flagcdn.com/24x18/pl.png"
    data-testid="language-pl-selector"
    @click="setLanguage('pl')"
    alt="Polish flag"
    role="button"
  />
  <span class="m-1"></span>
  <img
    src="https://flagcdn.com/24x18/gb.png"
    data-testid="language-en-selector"
    @click="setLanguage('en')"
    alt="English flag"
    role="button"
  />
</template>
<script setup>
import {useI18n} from 'vue-i18n'

const {locale} = useI18n()
const setLanguage = (language) => {
  localStorage.setItem('app-lang', language)
  locale.value = language
}
</script>
