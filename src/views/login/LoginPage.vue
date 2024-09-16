<template>
  <div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2" data-testid="login-page">
    <form @submit.prevent="submitForm">
      <Card>
        <template v-slot:header>
          <h1>{{ $t('login') }}</h1>
        </template>
        <template v-slot:body>
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
          <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
          <div class="text-center">
            <AppButton :is-disabled="isButtonDisabled" :isLoading="isLoading">
              {{ $t('loginLink') }}
            </AppButton>
          </div>
        </template>
      </Card>
    </form>
  </div>
</template>

<script setup>
import {computed, reactive, ref, watch} from 'vue'
import {Alert, AppButton, AppInput, Card} from '@/components'
import {useI18n} from 'vue-i18n'
import {login} from './api'

const INITIAL_FORM_STATE = {email: '', password: ''}

const {t} = useI18n()
const formState = reactive({...INITIAL_FORM_STATE})
const isButtonDisabled = computed(() => !(formState.password && formState.email))
const isLoading = ref(false)
const errorMessage = ref('')
const validationErrors = ref({})

const submitForm = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await login(formState)
  } catch (apiError) {
    handleApiError(apiError)
  } finally {
    isLoading.value = false
  }
}

const handleApiError = (apiError) => {
  if (apiError.response?.status === 400) {
    validationErrors.value = apiError.response.data.validationErrors
  } else if (apiError.response?.data?.message) {
    errorMessage.value = apiError.response.data.message
  } else {
    errorMessage.value = t('genericError')
  }
}

watch(
  () => formState.email,
  () => {
    delete validationErrors.value.email
  },
)
watch(
  () => formState.password,
  () => {
    delete validationErrors.value.password
  },
)
</script>
