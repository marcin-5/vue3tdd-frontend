<template>
  <Card>
    <template v-slot:header>
      <ProfileImage
        class="rounded-circle shadow"
        width="200"
        height="200"
        :alt="user.username + ' profile'"
        :temp-image="tempImageData"
        :image="image"
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
        <EditForm
          v-if="editMode"
          @cancel="onEditFinish"
          @save="onEditFinish"
          @new-image="onNewImage"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import {AppButton, Card, ProfileImage} from '@/components'
import UserDeleteButton from './UserDeleteButton.vue'
import EditForm from './EditForm.vue'
import {useAuthStore} from '@/stores/auth.js'
import {computed, ref} from 'vue'

const props = defineProps({
  user: Object,
})

const editMode = ref(false)
const tempImageData = ref()
const {authState} = useAuthStore()
const username = computed(() =>
  authState.id === props.user.id ? authState.username : props.user.username,
)
const image = computed(() => (authState.id === props.user.id ? authState.image : props.user.image))

const onNewImage = (imageData) => {
  tempImageData.value = imageData
}

const onEditFinish = () => {
  editMode.value = false
  tempImageData.value = undefined
}
</script>
