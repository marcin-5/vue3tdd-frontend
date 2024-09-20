<template>
  <form @submit.prevent="submit">
    <AppInput id="username" :label="$t('username')" v-model="authState.username" />
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
const {authState} = useAuthStore()
const isLoading = ref(false)

const submit = async () => {
  isLoading.value = true
  await updateUser(authState.id, {username: authState.username})
  emit('save')
}
</script>
