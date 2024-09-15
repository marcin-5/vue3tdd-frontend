import {render, router, screen, waitFor} from 'test/helper'
import User from './UserPage.vue'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {i18n} from '@/locales'
import {afterAll, beforeAll, beforeEach} from 'vitest'

let userId
const USER_RESPONSE = {id: 1, username: 'user1', email: 'user1@mail.com', image: null}

const server = setupServer(
  http.get('/api/v1/users/:id', async ({params}) => {
    userId = params.id
    return HttpResponse.json(USER_RESPONSE)
  }),
)

beforeAll(() => server.listen())
beforeEach(() => {
  userId = undefined
  server.resetHandlers()
})
afterAll(() => server.close())

const setup = async (path) => {
  await router.push(path)
  await router.isReady()
  return render(User)
}

describe('User Page', () => {
  it('sends user fetch request to server', async () => {
    await setup('/')
    await waitFor(() => {
      expect(userId).toBeDefined()
    })
  })

  describe.each([{userId: '123'}, {userId: '345'}])('when user id is $userId', ({userId}) => {
    it('sends id in request', async () => {
      await setup(`/user/${userId}`)
      await waitFor(() => {
        expect(userId).toBe(userId)
      })
    })
  })

  describe('when id is changed', () => {
    it('sends request with new id', async () => {
      await setup('/user/123')
      await waitFor(() => {
        expect(userId).toBe('123')
      })
      router.push('/user/345')
      await waitFor(() => {
        expect(userId).toBe('345')
      })
    })
  })

  describe('when network error occurs', () => {
    it('displays generic error message', async () => {
      server.use(
        http.get('/api/v1/users/:id', () => {
          return HttpResponse.error()
        }),
      )
      await setup('/user/1')
      const text = await screen.findByText('Unexpected error occurred, please try again')
      expect(text).toBeInTheDocument()
    })
  })

  describe('when user not found', () => {
    it('displays error message received in response', async () => {
      let resolveFunc
      const promise = new Promise((resolve) => {
        resolveFunc = resolve
      })
      server.use(
        http.get('/api/v1/users/:id', async () => {
          await promise
          return HttpResponse.json({message: 'User not found'}, {status: 404})
        }),
      )
      await setup('/user/1')
      expect(screen.queryByText('User not found')).not.toBeInTheDocument()
      await resolveFunc()
      await waitFor(() => {
        expect(screen.queryByText('User not found')).toBeInTheDocument()
      })
    })
  })

  describe('when user is found', () => {
    it('displays user name', async () => {
      let resolveFunc
      const promise = new Promise((resolve) => {
        resolveFunc = resolve
      })
      server.use(
        http.get('/api/v1/users/:id', async () => {
          await promise
          return HttpResponse.json(USER_RESPONSE)
        }),
      )
      await setup('/user/1')
      expect(screen.queryByText('user1')).not.toBeInTheDocument()
      await resolveFunc()
      await waitFor(() => {
        expect(screen.queryByText('user1')).toBeInTheDocument()
      })
    })
  })

  it('displays spinner', async () => {
    let resolveFunc
    const promise = new Promise((resolve) => {
      resolveFunc = resolve
    })
    server.use(
      http.get('/api/v1/users/:id', async () => {
        await promise
        return HttpResponse.json(USER_RESPONSE)
      }),
    )
    await setup('/user/1')
    const spinner = await screen.findByRole('status')
    expect(spinner).toBeInTheDocument()
    await resolveFunc()
    await waitFor(() => {
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe.each([{language: 'pl'}, {language: 'en'}])(
    'when language is $language',
    ({language}) => {
      it('should send expected language in accept language header', async () => {
        let acceptLanguage
        server.use(
          http.get('/api/v1/users/:id', async ({request}) => {
            acceptLanguage = request.headers.get('Accept-Language')
            return HttpResponse.error()
          }),
        )
        i18n.global.locale.value = language
        await setup('/user/1')
        await waitFor(() => {
          expect(acceptLanguage).toBe(language)
        })
      })
    },
  )
})
