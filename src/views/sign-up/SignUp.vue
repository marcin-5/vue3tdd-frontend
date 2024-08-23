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
    <input id="password" type="password" @input="onPasswordInput"/>
  </div>
  <div>
    <label for="passwordRepeat">Password repeat</label>
    <input id="passwordRepeat" type="password" @input="onPasswordInput"/>
  </div>
  <button :disabled="isDisabled()">Sign Up</button>
</template>

<script setup>
import {ref} from 'vue'

const PASSWORD_ID = 'password'
const PASSWORD_REPEAT_ID = 'passwordRepeat'

const password = ref('')
const passwordRepeat = ref('')

const isDisabled = () => {
  return (password.value || passwordRepeat.value) ? password.value !== passwordRepeat.value : true
}

const updatePasswordValue = (id, value) => {
  if (id === PASSWORD_ID) {
    password.value = value
  } else if (id === PASSWORD_REPEAT_ID) {
    passwordRepeat.value = value
  }
}

const onPasswordInput = (event) => {
  const {id, value} = event.target
  if (id === PASSWORD_ID || id === PASSWORD_REPEAT_ID) {
    updatePasswordValue(id, value)
  }
}
</script>
