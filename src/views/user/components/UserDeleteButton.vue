<template>
  <AppButton
    v-if="authState.id === id"
    variant="danger"
    @click="onClickDelete"
    :is-loading="isLoading"
    >{{ t('deleteUser.button') }}
  </AppButton>
  <Alert variant="danger" v-if="error">{{ error }}</Alert>
</template>

<script setup>
import {Alert, AppButton} from '@/components'
import {useAuthStore} from '@/stores/auth'
import {useI18n} from 'vue-i18n'
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {deleteUser} from './api'

defineProps({
  id: Number,
})
const {t} = useI18n()
const router = useRouter()
const {authState, logout} = useAuthStore()
const isLoading = ref(false)
const error = ref()

const onClickDelete = async () => {
  error.value = undefined
  const response = confirm(t('deleteUser.confirm'))
  if (response) {
    try {
      isLoading.value = true
      await deleteUser(authState.id)
      logout()
      await router.push('/')
    } catch {
      error.value = t('genericError')
      isLoading.value = false
    }
  }
}
</script>
