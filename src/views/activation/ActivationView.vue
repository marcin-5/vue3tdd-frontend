<template>
  <div data-testid="activation-page">
    <Alert v-if="status === 'success'">{{ data.message }}</Alert>
    <Alert v-if="status === 'fail'" variant="danger"> {{ error }}</Alert>
    <Alert variant="secondary" center v-if="status === 'loading'">
      <Spinner size="normal" />
    </Alert>
  </div>
</template>

<script setup>
import {Alert, Spinner} from '@/components'
import {activate} from '@/views/activation/api.js'
import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest.js'

const {status, data, error} = useRouteParamApiRequest(activate, 'token')
</script>
