<template>
  <button :class="`btn btn-${variant}`" :disabled="isDisabled || isLoading">
    <Spinner v-if="isLoading" />
    <slot />
  </button>
</template>

<script setup>
import Spinner from './LoadingSpinner.vue'

defineProps({
  isDisabled: Boolean,
  isLoading: Boolean,
  variant: {
    type: String,
    default: 'primary',
  },
})
</script>
