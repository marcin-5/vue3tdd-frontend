import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/views/home/HomeView.vue'
import SignUp from '@/views/sign-up/SignUp.vue'
import Activation from '@/views/activation/ActivationView.vue'
import PasswordResetRequest from '@/views/password-reset/request/RequestView.vue'
import PasswordResetSet from '@/views/password-reset/set/SetView.vue'
import User from '@/views/user/UserPage.vue'
import Login from '@/views/login/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/signup',
      component: SignUp,
    },
    {
      path: '/activation/:token',
      component: Activation,
    },
    {
      path: '/password-reset/request',
      component: PasswordResetRequest,
    },
    {
      path: '/password-reset/set',
      component: PasswordResetSet,
    },
    {
      path: '/user/:id',
      component: User,
    },
    {
      path: '/login',
      component: Login,
    },
  ],
})

export default router
