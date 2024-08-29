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
import {computed, reactive, ref, watch} from 'vue'
import axios from 'axios'
import {AppInput} from '@/components'

// Form State
const formState = reactive({
  email: '',
  username: '',
  password: '',
  passwordRepeat: '',
})

// Computed Properties
const isFormDisabled = computed(() => checkPasswordMismatch(formState))
const passwordError = computed(() => getPasswordMismatchMessage(formState))

// References
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const validationErrors = ref({})

// Helper Functions
function checkPasswordMismatch(form) {
  return form.password || form.passwordRepeat ? form.password !== form.passwordRepeat : true
}

function getPasswordMismatchMessage(form) {
  return form.password && form.password !== form.passwordRepeat ? 'Password mismatch' : null
}

function resetMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function manageApiError(error) {
  if (error.response?.status === 400) {
    validationErrors.value = error.response.data.validationErrors
  } else {
    errorMessage.value = 'Unexpected error occurred, please try again'
  }
}

function handleClearValidationError(field) {
  delete validationErrors.value[field]
}

// Form Submission Function
const submitForm = async () => {
  isLoading.value = true
  resetMessages()
  try {
    const {passwordRepeat, ...userData} = formState
    const response = await axios.post('/api/v1/users', userData)
    successMessage.value = response.data.message
  } catch (err) {
    manageApiError(err)
  } finally {
    isLoading.value = false
  }
}

// Function to setup watchers
function setupValidationWatchers(formState) {
  Object.keys(formState).forEach((field) => {
    watch(
      () => formState[field],
      () => handleClearValidationError(field),
    )
  })
}

// Setup watchers for validation
setupValidationWatchers(formState)
</script>
