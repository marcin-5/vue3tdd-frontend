import {defineStore} from 'pinia'
import {reactive, watch} from 'vue'

const INITIAL_AUTH_STATE = {
  id: 0,
  username: '',
  email: '',
}

function getInitialAuthState() {
  const storedState = localStorage.getItem('auth')
  if (storedState !== null) {
    try {
      return JSON.parse(storedState)
    } catch (error) {
      console.error('Failed to parse stored auth state:', error)
    }
  }
  return {}
}

const initialState = {...INITIAL_AUTH_STATE, ...getInitialAuthState()}

export const useAuthStore = defineStore('auth', () => {
  const auth = reactive({...initialState})

  function updateAuthState(data) {
    Object.assign(auth, data)
  }

  watch(
    auth,
    () => {
      localStorage.setItem('auth', JSON.stringify(auth))
    },
    {deep: true},
  )

  return {auth, updateAuthState}
})
