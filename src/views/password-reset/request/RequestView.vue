<template>
  <div class="col-lg-6 offset-lg-3 col-sm-8 offset-sm-2" data-testid="password-reset-request-page">
    <form @submit.prevent="submitForm">
      <Card>
        <template v-slot:header>
          <h1>{{ $t('passwordReset.request') }}</h1>
        </template>
        <template v-slot:body>
          <AppInput
            id="email"
            type="email"
            :label="$t('email')"
            :errorMessage="validationErrors.email"
            v-model="emailValue"
          />
          <Alert v-if="errorAlertMessage" variant="danger">{{ errorAlertMessage }}</Alert>
          <Alert v-if="successAlertMessage">{{ successAlertMessage }}</Alert>
          <div class="text-center">
            <AppButton :is-disabled="!emailValue" :in-progress="isLoading">
              {{ $t('passwordReset.request') }}
            </AppButton>
          </div>
        </template>
      </Card>
    </form>
  </div>
</template>

<script setup>
import {Alert, AppButton, AppInput, Card} from '@/components'
import {ref, watch} from 'vue'
import {passwordReset} from './api'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

const EMAIL_FIELD = 'email'
const GENERIC_ERROR = t('genericError')
const emailValue = ref('')
const isLoading = ref(false)
const successAlertMessage = ref()
const errorAlertMessage = ref()
const validationErrors = ref({})

const handleApiError = (error) => {
  if (error.response?.data?.validationErrors) {
    validationErrors.value = error.response.data.validationErrors
  } else if (error.response?.data?.message) {
    errorAlertMessage.value = error.response.data.message
  } else {
    errorAlertMessage.value = GENERIC_ERROR
  }
}

const submitForm = async () => {
  isLoading.value = true
  errorAlertMessage.value = undefined
  try {
    const response = await passwordReset({email: emailValue.value})
    successAlertMessage.value = response.data.message
  } catch (error) {
    handleApiError(error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => emailValue.value,
  () => {
    delete validationErrors.value[EMAIL_FIELD]
  },
)
</script>
