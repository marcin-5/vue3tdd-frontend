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
            <AppButton :is-disabled="isButtonDisabled" :in-progress="isLoading">
              {{ $t('loginLink') }}
            </AppButton>
          </div>
        </template>
        <template v-slot:footer>
          <router-link to="/password-reset/request">{{ $t('passwordReset.forgot') }}</router-link>
        </template>
      </Card>
    </form>
  </div>
</template>

<script setup>
import {computed, reactive, ref, watch} from 'vue'
import {Alert, AppButton, AppInput, Card} from '@/components'
import {useI18n} from 'vue-i18n'
import {useRouter} from 'vue-router'
import {login} from './api'
import {useAuthStore} from '@/stores/auth'

const INITIAL_FORM_STATE = {email: '', password: ''}

const router = useRouter()
const {updateAuthState} = useAuthStore()
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
    const response = await login(formState)
    updateAuthState(response.data)
    await router.push('/')
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
