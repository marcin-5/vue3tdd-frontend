<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <form class="card" @submit.prevent="submit">
      <div class="card-header text-center">
        <h1>Sign Up</h1>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label" for="username">Username</label>
          <input class="form-control" id="username" v-model="formState.username" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="email">Email</label>
          <input class="form-control" id="email" v-model="formState.email" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Password</label>
          <input class="form-control" id="password" type="password" v-model="formState.password" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="passwordRepeat">Password repeat</label>
          <input
            class="form-control"
            id="passwordRepeat"
            type="password"
            v-model="formState.passwordRepeat"
          />
        </div>
        <div class="text-center">
          <button class="btn btn-primary" :disabled="isDisabledComputed">Sign Up</button>
        </div>
      </div>
    </form>
  </div>
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
