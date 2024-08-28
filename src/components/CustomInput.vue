<template>
  <div :class="inputWrapperClass">
    <label :class="labelClass" :for="id">{{ label }}</label>
    <input :class="inputClass" :id="id" @input="handleInput" />
    <span>{{ errorMessage }}</span>
  </div>
</template>

<script setup>
const inputWrapperClass = 'mb-3'
const labelClass = 'form-label'
const inputClass = 'form-control'

defineProps({
  label: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  errorMessage: String,
})

const emit = defineEmits(['customInput'])

function handleInput(event) {
  emit('customInput', event.target.value)
}
</script>
