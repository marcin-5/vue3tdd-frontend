<template>
  <Card>
    <template v-slot:header>
      <img
        class="rounded-circle shadow"
        width="200"
        height="200"
        :alt="user.username + ' profile'"
        src="@/assets/profile.png"
      />
    </template>
    <template v-slot:body>
      <div class="text-center">
        <template v-if="!editMode">
          <h3 data-testid="h3-username">{{ username }}</h3>
          <AppButton v-if="authState.id === user.id" @click="editMode = !editMode"
            >{{ $t('edit') }}
          </AppButton>
          <div class="mt-3"></div>
          <UserDeleteButton :id="user.id" />
        </template>
        <EditForm v-if="editMode" @cancel="editMode = false" @save="editMode = false" />
      </div>
    </template>
  </Card>
</template>

<script setup>
import {AppButton, Card} from '@/components'
import UserDeleteButton from './UserDeleteButton.vue'
import EditForm from './EditForm.vue'
import {useAuthStore} from '@/stores/auth.js'
import {computed, ref} from 'vue'

const props = defineProps({
  user: Object,
})

const editMode = ref(false)
const {authState} = useAuthStore()
const username = computed(() =>
  authState.id === props.user.id ? authState.username : props.user.username,
)
</script>
