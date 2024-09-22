<template>
  <nav class="navbar navbar-expand bg-body-tertiary shadow-sm">
    <div class="container">
      <router-link class="navbar-brand" data-testid="link-home-page" to="/">
        <img
          src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/house-door.svg"
          alt="Home logo"
          width="32"
        />
        Home
      </router-link>
      <ul class="navbar-nav">
        <template v-if="!authState.id">
          <li class="nav-item">
            <router-link class="nav-link" to="/login" data-testid="link-login-page"
              >{{ $t('loginLink') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" data-testid="link-signup-page" to="/signup"
              >{{ $t('signUp') }}
            </router-link>
          </li>
        </template>
        <template v-if="authState.id">
          <li class="nav-item">
            <router-link
              class="nav-link"
              :to="'/user/' + authState.id"
              data-testid="link-my-profile"
            >
              <img
                src="@/assets/profile.png"
                :alt="authState.username + ' profile'"
                width="30"
                class="rounded-circle shadow-sm"
              />
              {{ authState.username }}
            </router-link>
          </li>
          <li class="nav-item">
            <span class="nav-link" data-testid="link-logout" role="button" @click="logout">
              {{ $t('logout') }}
            </span>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import {useAuthStore} from '@/stores/auth'
import http from '@/lib/http'

const {authState, logout: logoutStore} = useAuthStore()

const logout = async () => {
  logoutStore()
  try {
    await http.post('/api/v1/logout')
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}
</script>
