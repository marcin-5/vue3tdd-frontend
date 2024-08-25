<template>
  <form @submit.prevent="submit">
    <h1>Sign Up</h1>
    <div>
      <label for="username">Username</label>
      <input id="username" v-model="formState.username" />
    </div>
    <div>
      <label for="email">Email</label>
      <input id="email" v-model="formState.email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input id="password" type="password" v-model="formState.password" />
    </div>
    <div>
      <label for="passwordRepeat">Password repeat</label>
      <input id="passwordRepeat" type="password" v-model="formState.passwordRepeat" />
    </div>
    <button :disabled="isDisabledComputed">Sign Up</button>
  </form>
</template>

<script setup>
import {computed, reactive} from 'vue'
import axios from 'axios'

const formState = reactive({email: '', username: '', password: '', passwordRepeat: ''})

const isDisabledComputed = computed(() => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true
})

const submit = () => {
  const {passwordRepeat, ...body} = formState
  axios.post('/api/v1/users', body)
}
</script>
