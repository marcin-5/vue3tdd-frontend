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
    <div class="card-footer">
      <button
        :class="BUTTON_CLASSES"
        @click="loadUsers(usersData.page - 1)"
        v-if="usersData.page !== 0"
      >
        {{ $t('userList.previous') }}
      </button>
      <button
        :class="BUTTON_CLASSES"
        @click="loadUsers(usersData.page + 1)"
        v-if="usersData.page + 1 < usersData.totalPages"
      >
        {{ $t('userList.next') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive} from 'vue'
import {fetchUsers} from './api'

const BUTTON_CLASSES = 'btn btn-outline-secondary btn-sm'
const INITIAL_USERS_DATA = {
  content: [],
  page: 0,
  size: 0,
  totalPages: 0,
}

const usersData = reactive({...INITIAL_USERS_DATA})

const updateUsersData = ({content, page, size, totalPages}) => {
  usersData.content = content
  usersData.page = page
  usersData.size = size
  usersData.totalPages = totalPages
}

const loadUsers = async (page = 0) => {
  const response = await fetchUsers(page)
  updateUsersData(response.data)
}

onMounted(() => loadUsers())
</script>
