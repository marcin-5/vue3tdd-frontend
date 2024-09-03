import {vi} from 'vitest'
import axios from 'axios'
import {signUp} from './api'

vi.mock('axios')
vi.mock('@/locales', () => ({
  i18n: {
    global: {
      locale: {value: 'ab'},
    },
  },
}))

describe('signUp', () => {
  it('calls axios with expected params', () => {
    const body = {key: 'value'}
    signUp(body)
    expect(axios.post).toHaveBeenCalledWith('/api/v1/users', body, {
      headers: {
        'Accept-Language': 'ab',
      },
    })
  })
})
