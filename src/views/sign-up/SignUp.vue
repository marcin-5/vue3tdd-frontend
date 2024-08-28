<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <form class="card" @submit.prevent="submit" data-testid="sign-up-form" v-if="!successMessage">
      <div class="card-header text-center">
        <h1>Sign Up</h1>
      </div>
      <div class="card-body">
        <AppInput
          id="username"
          label="Username"
          :error-message="errors.username"
          v-model="formState.username"
        />
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
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div class="text-center">
          <button class="btn btn-primary" :disabled="isDisabledComputed || apiProgress">
            <span v-if="apiProgress" role="status" class="spinner-border spinner-border-sm"></span>
            Sign Up
          </button>
        </div>
      </div>
    </form>
    <div v-else class="alert alert-success">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import {computed, reactive, ref} from 'vue'
import axios from 'axios'
import {AppInput} from '@/components'

const formState = reactive({email: '', username: '', password: '', passwordRepeat: ''})

const isDisabledComputed = computed(() => {
  return formState.password || formState.passwordRepeat
    ? formState.password !== formState.passwordRepeat
    : true
})

const apiProgress = ref(false)
const successMessage = ref()
const errorMessage = ref()
const errors = ref({})

const submit = async () => {
  apiProgress.value = true
  errorMessage.value = undefined
  const {passwordRepeat, ...body} = formState
  try {
    const response = await axios.post('/api/v1/users', body)
    successMessage.value = response.data.message
  } catch (apiError) {
    if (apiError.response?.status === 400) {
      errors.value = apiError.response.data.validationErrors
    } else errorMessage.value = 'Unexpected error occurred, please try again'
  } finally {
    apiProgress.value = false
  }
}
</script>
