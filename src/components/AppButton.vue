<template>
  <button :class="`btn btn-${variant}`" :disabled="isDisabled || inProgress">
    <Spinner v-if="inProgress" />
    <slot />
  </button>
</template>

<script setup>
import Spinner from './LoadingSpinner.vue'

defineProps({
  isDisabled: Boolean,
  inProgress: Boolean,
  variant: {
    type: String,
    default: 'primary',
  },
})
</script>
