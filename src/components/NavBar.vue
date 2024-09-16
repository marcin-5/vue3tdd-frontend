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
      </ul>
    </div>
  </nav>
</template>
