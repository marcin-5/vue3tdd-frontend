import {vi} from 'vitest'
import http from './http'

vi.mock('@/locales', () => ({
  i18n: {
    global: {
      locale: {value: 'ab'},
    },
  },
}))

describe('http', () => {
  it('adds i18n locale to accept language header', () => {
    const requestConfig = {
      url: '/some-url',
      method: 'get',
      headers: {},
    }
    http.interceptors.request.handlers[0].fulfilled(requestConfig)
    expect(requestConfig.headers['Accept-Language']).toBe('ab')
  })
})
