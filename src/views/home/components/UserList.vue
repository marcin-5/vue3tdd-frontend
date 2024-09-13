<template>
  <div class="card">
    <div class="card-header text-center">
      <h3>{{ $t('userList.header') }}</h3>
    </div>
    <ul class="list-group list-group-flush">
      <li
        class="list-group-item list-group-item-action"
        v-for="user in usersData.content"
        :key="user.id"
      >
        {{ user.username }}
      </li>
    </ul>
    <div class="card-footer text-center">
      <button
        class="btn btn-outline-secondary btn-sm float-start"
        @click="loadUsers(usersData.page - 1)"
        v-if="usersData.page !== 0"
      >
        {{ $t('userList.previous') }}
      </button>
      <LoadingSpinner v-if="isLoading" size="normal"></LoadingSpinner>
      <button
        class="btn btn-outline-secondary btn-sm float-end"
        @click="loadUsers(usersData.page + 1)"
        v-if="usersData.page + 1 < usersData.totalPages"
      >
        {{ $t('userList.next') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {fetchUsers} from './api'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

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
