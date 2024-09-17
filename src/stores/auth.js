import {defineStore} from 'pinia'
import {reactive, watch} from 'vue'

const AUTH_STORAGE_KEY = 'auth'
const INITIAL_AUTH_STATE = {
  id: 0,
  username: '',
  email: '',
}

function getStoredAuthState() {
  const storedState = localStorage.getItem(AUTH_STORAGE_KEY)
  if (storedState !== null) {
    try {
      return JSON.parse(storedState)
    } catch (error) {
      console.error('Failed to parse stored auth state:', error)
    }
  }
  return {...INITIAL_AUTH_STATE}
}

function saveAuthState(state) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
}

export const useAuthStore = defineStore('auth', () => {
  const authState = reactive({...getStoredAuthState()})

  function updateAuthState(data) {
    Object.assign(authState, data)
    saveAuthState(authState)
  }

  watch(
    authState,
    () => {
      saveAuthState(authState)
    },
    {deep: true},
  )

  return {authState, updateAuthState}
})
