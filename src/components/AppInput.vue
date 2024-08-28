<template>
  <div :class="classes.wrapper">
    <label :class="classes.label" :for="id">{{ label }}</label>
    <input :class="[classes.input, {' is-invalid': errorMessage}]" :id="id" @input="onInput" />
    <span :class="[classes.span, {' invalid-feedback': errorMessage}]">{{ errorMessage }}</span>
  </div>
</template>
<script setup>
const classes = {
  wrapper: 'mb-3',
  label: 'form-label',
  input: 'form-control',
  span: '',
}

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
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>
