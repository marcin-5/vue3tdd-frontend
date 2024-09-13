import http from '@/lib/http'

export const fetchUsers = (page = 0, size = 3) => {
  return http.get('/api/v1/users', {params: {page, size}})
}
