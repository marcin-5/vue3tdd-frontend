import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/views/home/HomeView.vue'
import SignUp from '@/views/sign-up/SignUp.vue'
import Activation from '@/views/activation/ActivationView.vue'

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
  ],
})

export default router
