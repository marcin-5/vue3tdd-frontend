import {defineStore} from 'pinia'
import {reactive} from 'vue'

const initialAuthState = {
  id: 0,
  username: '',
  email: '',
}

export const useAuthStore = defineStore('auth', () => {
  const auth = reactive({...initialAuthState})

  function updateAuthState(data) {
    Object.assign(auth, data)
  }

  return {auth, updateAuthState}
})
