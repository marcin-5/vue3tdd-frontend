import {vi} from 'vitest'
import http from '@/lib/http'
import {activate} from './api'

vi.mock('@/lib/http')

describe('activate', () => {
  it('calls axios with expected params', () => {
    activate('123')
    expect(http.patch).toHaveBeenCalledWith('/api/v1/users/123/active')
  })
})
