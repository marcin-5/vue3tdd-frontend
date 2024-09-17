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
        <template v-if="!auth.id">
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
        <li class="nav-item" v-if="auth.id">
          <router-link class="nav-link" data-testid="link-my-profile" :to="'/user/' + auth.id">
            My profile
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import {useAuthStore} from '@/stores/auth'

const {auth} = useAuthStore()
</script>
