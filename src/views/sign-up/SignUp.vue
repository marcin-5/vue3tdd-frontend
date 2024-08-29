<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
    <form
      class="card"
      @submit.prevent="submitForm"
      data-testid="sign-up-form"
      v-if="!successMessage"
    >
      <div class="card-header text-center">
        <h1>Sign Up</h1>
      </div>
      <div class="card-body">
        <AppInput
          id="username"
          label="Username"
          :error-message="validationErrors.username"
          v-model="formState.username"
        />
        <AppInput
          id="email"
          type="email"
          label="Email"
          :error-message="validationErrors.email"
          v-model="formState.email"
        />
        <AppInput
          id="password"
          type="password"
          label="Password"
          :error-message="validationErrors.password"
          v-model="formState.password"
        />
        <AppInput
          id="passwordRepeat"
          type="password"
          label="Password repeat"
          :error-message="passwordError"
          v-model="formState.passwordRepeat"
        />
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div class="text-center">
          <button class="btn btn-primary" :disabled="isFormDisabled || isLoading">
            <span v-if="isLoading" role="status" class="spinner-border spinner-border-sm"></span>
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

const isFormDisabled = computed(() => isPasswordMismatch(formState))
const passwordError = computed(() => getPasswordMismatchMessage(formState))

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const validationErrors = ref({})

const submitForm = async () => {
  isLoading.value = true
  clearMessages()

  try {
    const {passwordRepeat, ...userData} = formState
    const response = await axios.post('/api/v1/users', userData)
    successMessage.value = response.data.message
  } catch (err) {
    handleApiError(err)
  } finally {
    isLoading.value = false
  }
}

function isPasswordMismatch(form) {
  return form.password || form.passwordRepeat ? form.password !== form.passwordRepeat : true
}

function getPasswordMismatchMessage(form) {
  return form.password !== form.passwordRepeat ? 'Password mismatch' : null
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function handleApiError(error) {
  if (error.response?.status === 400) {
    validationErrors.value = error.response.data.validationErrors
  } else {
    errorMessage.value = 'Unexpected error occurred, please try again'
  }
}
</script>
