<template>
  <div class="card">
    <div class="card-header text-center">
      <h3>User List</h3>
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
  </div>
</template>
<script setup>
import {loadUsers as fetchUserData} from './api'
import {onMounted, reactive} from 'vue'

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

const loadUsers = async () => {
  const response = await fetchUserData()
  updateUsersData(response.data)
}

onMounted(loadUsers)
</script>
