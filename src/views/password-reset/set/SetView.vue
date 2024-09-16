<template>
  <div class="col-lg-6 offset-lg-3 col-sm-8 offset-sm-2" data-testid="password-reset-set-page">
    <form @submit.prevent="handleSubmit">
      <Card>
        <template v-slot:header>
          <h1>{{ $t('passwordReset.set') }}</h1>
        </template>
        <template v-slot:body>
          <AppInput
            id="password"
            type="password"
            :label="$t('password')"
            :error-message="errors.password"
            v-model="password"
          />
          <AppInput
            id="passwordRepeat"
            type="password"
            :label="$t('passwordRepeat')"
            :error-message="passwordMatchError"
            v-model="passwordRepeat"
          />
          <Alert v-if="errorMessage" variant="danger">{{ errorMessage }}</Alert>
          <div class="text-center">
            <AppButton :is-disabled="isButtonDisabled" :is-loading="apiProgress">
              {{ $t('passwordReset.set') }}
            </AppButton>
          </div>
        </template>
      </Card>
    </form>
  </div>
</template>

<script setup>
import {Alert, AppButton, AppInput, Card} from '@/components'
import {computed, ref, watch} from 'vue'
import {passwordSet} from './api'
import {useI18n} from 'vue-i18n'
import {useRoute, useRouter} from 'vue-router'

const {t} = useI18n()
const route = useRoute()
const router = useRouter()
const password = ref('')
const passwordRepeat = ref('')
const apiProgress = ref(false)
const errorMessage = ref()
const errors = ref({})

const handleSubmit = async () => {
  apiProgress.value = true
  clearErrors()
  try {
    await passwordSet(route.query.tk, {password: password.value})
    await router.push('/login')
  } catch (apiError) {
    handleApiError(apiError)
  } finally {
    apiProgress.value = false
  }
}

const clearErrors = () => {
  errorMessage.value = undefined
  delete errors.value.password
}

const handleApiError = (apiError) => {
  const apiErrorResponse = apiError.response?.data
  if (apiErrorResponse?.validationErrors) {
    errors.value = apiErrorResponse.validationErrors
  } else if (apiErrorResponse?.message) {
    errorMessage.value = apiErrorResponse.message
  } else {
    errorMessage.value = t('genericError')
  }
}

watch(() => password.value, clearErrors)

const isButtonDisabled = computed(() => !password.value || password.value !== passwordRepeat.value)

const passwordMatchError = computed(() =>
  password.value !== passwordRepeat.value ? t('passwordMismatch') : '',
)
</script>
