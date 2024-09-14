<template>
  <Card>
    <template v-slot:header>
      <h3>{{ $t('userList.header') }}</h3>
    </template>
    <template v-slot:default>
      <ul class="list-group list-group-flush">
        <UserItem v-for="user in usersData.content" :user="user" :key="user.id" />
      </ul>
    </template>
    <template v-slot:footer>
      <button
        class="btn btn-outline-secondary btn-sm float-start"
        @click="loadUsers(usersData.page - 1)"
        v-if="usersData.page !== 0"
      >
        {{ $t('userList.previous') }}
      </button>
      <Spinner v-if="isLoading" size="normal"></Spinner>
      <button
        class="btn btn-outline-secondary btn-sm float-end"
        @click="loadUsers(usersData.page + 1)"
        v-if="usersData.page + 1 < usersData.totalPages"
      >
        {{ $t('userList.next') }}
      </button>
    </template>
  </Card>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {fetchUsers} from './api'
import {Card, Spinner} from '@/components'
import UserItem from '@/views/home/components/UserItem.vue'

const INITIAL_USERS_DATA = {
  content: [],
  page: 0,
  size: 0,
  totalPages: 0,
}

const isLoading = ref(false)
const usersData = reactive({...INITIAL_USERS_DATA})

const updateUsersData = ({content, page, size, totalPages}) => {
  usersData.content = content
  usersData.page = page
  usersData.size = size
  usersData.totalPages = totalPages
}

const loadUsers = async (page = 0) => {
  isLoading.value = true
  const response = await fetchUsers(page)
  updateUsersData(response.data)
  isLoading.value = false
}

onMounted(() => loadUsers())
</script>
