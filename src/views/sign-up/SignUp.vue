<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2" data-testid="signup-page">
    <form @submit.prevent="submitForm" data-testid="sign-up-form" v-if="!successMessage">
      <Card>
        <template v-slot:header>
          <h1>{{ $t('signUp') }}</h1>
        </template>
        <template v-slot:body>
          <AppInput
            id="username"
            :label="$t('username')"
            :error-message="validationErrors.username"
            v-model="formState.username"
          />
          <AppInput
            id="email"
            type="email"
            :label="$t('email')"
            :error-message="validationErrors.email"
            v-model="formState.email"
          />
          <AppInput
            id="password"
            type="password"
            :label="$t('password')"
            :error-message="validationErrors.password"
            v-model="formState.password"
          />
          <AppInput
            id="passwordRepeat"
            type="password"
            :label="$t('passwordRepeat')"
            :error-message="passwordError"
            v-model="formState.passwordRepeat"
          />
          <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
          <div class="text-center">
            <AppButton :is-disabled="isButtonDisabled" :isLoading="isLoading">
              {{ $t('signUp') }}
            </AppButton>
          </div>
        </template>
      </Card>
    </form>
    <Alert v-else>{{ successMessage }}</Alert>
  </div>
</template>

<script setup>
import {computed, reactive, ref, watch} from 'vue'
import {Alert, AppButton, AppInput, Card} from '@/components'
import {useI18n} from 'vue-i18n'
import {signUp} from '@/views/sign-up/api.js'

const {t} = useI18n()

// Form State
const formState = reactive({
  email: '',
  username: '',
  password: '',
  passwordRepeat: '',
})

// Computed Properties
const isButtonDisabled = computed(() => checkPasswordMismatch(formState))
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
  return form.password && form.password !== form.passwordRepeat ? t('passwordMismatch') : null
}

function resetMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function manageApiError(error) {
  if (error.response?.status === 400) {
    validationErrors.value = error.response.data.validationErrors
  } else {
    errorMessage.value = t('genericError')
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
    const response = await signUp(userData)
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
