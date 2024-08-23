<template>
  <h1>Sign Up</h1>
  <div>
    <label for="username">Username</label>
    <input id="username"/>
  </div>
  <div>
    <label for="email">Email</label>
    <input id="email"/>
  </div>
  <div>
    <label for="password">Password</label>
    <input id="password" type="password" @input="(event) => (password = event.target.value)"/>
  </div>
  <div>
    <label for="passwordRepeat">Password repeat</label>
    <input id="passwordRepeat" type="password" @input="(event) => (passwordRepeat = event.target.value)"/>
  </div>
  <button :disabled="isDisabledComputed">Sign Up</button>
</template>

<script setup>
import {computed, ref} from 'vue'

const PASSWORD_ID = 'password'
const PASSWORD_REPEAT_ID = 'passwordRepeat'

const password = ref('')
const passwordRepeat = ref('')

const isDisabledComputed = computed(() => {
  return (password.value || passwordRepeat.value) ? password.value !== passwordRepeat.value : true
})
</script>
