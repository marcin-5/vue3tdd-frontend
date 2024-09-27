<template>
  <form @submit.prevent="handleSubmit">
    <AppInput
      id="username"
      :label="$t('username')"
      v-model="username"
      :error-message="validationErrors.username"
    />
    <AppInput
      id="image"
      :label="$t('selectImage')"
      type="file"
      @change="onImageChange"
      :error-message="validationErrors.image"
    />
    <Alert v-if="generalError" variant="danger">{{ generalError }}</Alert>
    <AppButton type="submit" :in-progress="isSaving">{{ $t('save') }}</AppButton>
    <div class="d-inline m-1"></div>
    <AppButton type="button" variant="outline-secondary" @click="$emit('cancel')"
      >{{ $t('cancel') }}
    </AppButton>
  </form>
</template>

<script setup>
import {Alert, AppButton, AppInput} from '@/components'
import {useAuthStore} from '@/stores/auth'
import {ref, watch} from 'vue'
import {updateUser} from './api'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
const emit = defineEmits(['cancel', 'save', 'newImage'])
const {authState, updateAuthState} = useAuthStore()

const image = ref()
const isSaving = ref(false)
const username = ref(authState.username)
const generalError = ref()
const validationErrors = ref({})

const userId = authState.id

const handleSubmit = async () => {
  isSaving.value = true
  generalError.value = undefined
  try {
    const result = await updateUser(userId, {username: username.value, image: image.value})
    updateAuthState({username: username.value, image: result.data.image})
    emit('save')
  } catch (apiError) {
    handleError(apiError)
  } finally {
    isSaving.value = false
  }
}

const handleError = (error) => {
  if (error.response?.status === 400) {
    validationErrors.value = error.response.data.validationErrors
  } else {
    generalError.value = t('genericError')
  }
}

const onImageChange = (event) => {
  delete validationErrors.value.image
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onloadend = () => {
    const imageData = reader.result
    image.value = imageData.split(',')[1]
    emit('newImage', imageData)
  }
  reader.readAsDataURL(file)
}

watch(
  () => username.value,
  () => {
    delete validationErrors.value.username
  },
)
</script>
