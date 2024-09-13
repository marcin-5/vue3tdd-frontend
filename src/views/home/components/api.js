import http from '@/lib/http'

export const loadUsers = (page = 0, size = 3) => {
  return http.get('/api/v1/users', {params: {page, size}})
}
