import {render, router, screen, waitFor} from 'test/helper'
import User from './UserPage.vue'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach} from 'vitest'
import {i18n} from '@/locales'

let counter = 0
let id
const server = setupServer(
  http.get('/api/v1/users/:id', async ({params}) => {
    counter += 1
    id = params.id
    return HttpResponse.json({
      id: Number(id),
      username: `user${id}`,
      email: `user${id}@mail.com`,
      image: null,
    })
  }),
)

beforeAll(() => server.listen())
beforeEach(() => {
  counter = 0
  id = undefined
  server.resetHandlers()
})
afterAll(() => server.close())

const setup = async (path) => {
  await router.push(path)
  await router.isReady()
  return render(User)
}

describe('User Page', () => {
  describe('when there is logged in user', () => {
    const setupPageLoaded = async (id = '3') => {
      const result = await setup(`/user/${id}`)
      await screen.findByText(`user${id}`)
      const deleteButton = screen.queryByRole('button', {name: 'Delete'})
      const editButton = screen.queryByRole('button', {name: 'Edit'})
      return {...result, elements: {deleteButton, editButton}}
    }

    beforeEach(() => {
      localStorage.setItem('auth', JSON.stringify({id: 3, username: 'user3'}))
    })
    describe('when user id matches to logged in user id', () => {
      it('displays edit button', async () => {
        const {
          elements: {editButton},
        } = await setupPageLoaded()
        expect(editButton).toBeInTheDocument()
      })

      describe('when user clicks edit button', () => {
        it('displays username input', async () => {
          const {
            user,
            elements: {editButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(screen.getByLabelText('Username')).toBeInTheDocument()
        })
        it('hides edit button', async () => {
          const {
            user,
            elements: {editButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(editButton).not.toBeInTheDocument()
        })

        it('hides delete button', async () => {
          const {
            user,
            elements: {editButton, deleteButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(deleteButton).not.toBeInTheDocument()
        })

        it('hides username', async () => {
          const {
            user,
            elements: {editButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(screen.queryByText('user3')).not.toBeInTheDocument()
        })

        it('sets username as initial value for input', async () => {
          const {
            user,
            elements: {editButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(screen.getByLabelText('Username')).toHaveValue('user3')
        })

        it('displays save button', async () => {
          const {
            user,
            elements: {editButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(screen.queryByRole('button', {name: 'Save'})).toBeInTheDocument()
        })

        it('displays cancel button', async () => {
          const {
            user,
            elements: {editButton},
          } = await setupPageLoaded()
          await user.click(editButton)
          expect(screen.queryByRole('button', {name: 'Cancel'})).toBeInTheDocument()
        })

        describe('when user clicks cancel', () => {
          it('displays username', async () => {
            const {
              user,
              elements: {editButton},
            } = await setupPageLoaded()
            await user.click(editButton)
            await user.click(screen.queryByRole('button', {name: 'Cancel'}))
            await waitFor(() => {
              expect(screen.queryByText('user3')).toBeInTheDocument()
            })
          })
        })
      })
    })

    describe('when user id do not match to logged in user id', () => {
      it('does not display edit button', async () => {
        const {
          elements: {editButton},
        } = await setupPageLoaded('1')
        expect(editButton).not.toBeInTheDocument()
      })
    })
  })

  it('sends user fetch request to server', async () => {
    await setup('/')
    await waitFor(() => {
      expect(counter).toBe(1)
    })
  })

  describe.each([{userId: '123'}, {userId: '345'}])('when user id is $userId', ({userId}) => {
    it('sends id in request', async () => {
      await setup(`/user/${userId}`)
      await waitFor(() => {
        expect(id).toBe(userId)
      })
    })
  })

  describe('when id is changed', () => {
    it('sends request with new id', async () => {
      await setup('/user/123')
      await waitFor(() => {
        expect(id).toBe('123')
      })
      router.push('/user/345')
      await waitFor(() => {
        expect(id).toBe('345')
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
          return HttpResponse.json({
            id: 1,
            username: 'user1',
            email: 'user1@mail.com',
            image: null,
          })
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

  it('displays spinner', async () => {
    let resolveFunc
    const promise = new Promise((resolve) => {
      resolveFunc = resolve
    })
    server.use(
      http.get('/api/v1/users/:id', async () => {
        await promise
        return HttpResponse.json({id: 1, username: 'user1', email: 'user1@mail.com', image: null})
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
})
