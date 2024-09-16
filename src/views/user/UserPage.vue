<template>
  <div data-testid="user-page">
    <Alert variant="danger" v-if="status === 'fail'">{{ error }}</Alert>
    <Alert variant="secondary" center v-if="status === 'loading'">
      <Spinner size="normal" />
    </Alert>
    <ProfileCard v-if="status === 'success'" :user="data" />
  </div>
</template>

<script setup lang="ts">
import {Alert, Spinner} from '@/components'
import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest'
import {getUserById} from '@/views/user/api.js'
import ProfileCard from './components/ProfileCard.vue'

const {status, data, error} = useRouteParamApiRequest(getUserById, 'id')
</script>
