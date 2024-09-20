<template>
  <form @submit.prevent="submit">
    <AppInput id="username" :label="$t('username')" v-model="username" />
    <AppButton type="submit" :is-loading="isLoading">{{ $t('save') }}</AppButton>
    <div class="d-inline m-1"></div>
    <AppButton type="button" variant="outline-secondary" @click="$emit('cancel')"
      >{{ $t('cancel') }}
    </AppButton>
  </form>
</template>

<script setup>
import {AppButton, AppInput} from '@/components'
import {useAuthStore} from '@/stores/auth'
import {ref} from 'vue'
import {updateUser} from './api'

const emit = defineEmits(['cancel', 'save'])
const {authState, updateAuthState} = useAuthStore()
const isLoading = ref(false)
const username = ref(authState.username)

const submit = async () => {
  isLoading.value = true
  await updateUser(authState.id, {username: username.value})
  updateAuthState({username: username.value})
  emit('save')
}
</script>
