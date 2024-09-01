<template>
  <img
    src="https://flagcdn.com/24x18/pl.png"
    data-testid="language-pl-selector"
    @click="$i18n.locale = 'pl'"
    alt="Polish flag"
    role="button"
  />
  <span class="m-1"></span>
  <img
    src="https://flagcdn.com/24x18/gb.png"
    data-testid="language-en-selector"
    @click="$i18n.locale = 'en'"
    alt="English flag"
    role="button"
  />
</template>
