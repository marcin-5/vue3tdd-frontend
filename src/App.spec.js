import {render, router, screen, waitFor} from 'test/helper'
import App from './App.vue'
import {afterAll, beforeAll, beforeEach, vi} from 'vitest'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'

vi.mock('@/views/activation/ActivationView.vue')
vi.mock('@/views/home/components/UserList.vue')
vi.mock('@/views/user/User.vue')

const server = setupServer(
  http.post('/api/v1/auth', () => {
    return HttpResponse.json({id: 1, username: 'user1', email: 'user1@mail.com', image: null})
  }),
)

const setupAndRenderApp = async (path) => {
  await router.push(path)
  await router.isReady()
  return render(App)
}

const routeTestCases = [
  {path: '/', pageId: 'home-page'},
  {path: '/signup', pageId: 'signup-page'},
  {path: '/activation/123', pageId: 'activation-page'},
  {path: '/activation/456', pageId: 'activation-page'},
  {path: '/password-reset/request', pageId: 'password-reset-request-page'},
  {path: '/password-reset/set', pageId: 'password-reset-set-page'},
  {path: '/user/1', pageId: 'user-page'},
  {path: '/user/2', pageId: 'user-page'},
  {path: '/login', pageId: 'login-page'},
]

const clickTestCases = [
  {initialPath: '/', clickingTo: 'link-signup-page', visiblePage: 'signup-page'},
  {initialPath: '/signup', clickingTo: 'link-home-page', visiblePage: 'home-page'},
  {initialPath: '/', clickingTo: 'link-login-page', visiblePage: 'login-page'},
]

beforeEach(() => server.resetHandlers())
beforeAll(() => server.listen())
afterAll(() => server.close())

describe('Routing', () => {
  describe.each(routeTestCases)('when path is $path', ({path, pageId}) => {
    it(`displays ${pageId}`, async () => {
      await setupAndRenderApp(path)
      const page = screen.queryByTestId(pageId)
      expect(page).toBeInTheDocument()
    })
  })

  describe.each(clickTestCases)(
    'when path is $initialPath',
    ({initialPath, clickingTo, visiblePage}) => {
      describe(`when user clicks ${clickingTo}`, () => {
        it(`displays ${visiblePage}`, async () => {
          const {user} = await setupAndRenderApp(initialPath)
          const link = screen.queryByTestId(clickingTo)
          await user.click(link)
          await waitFor(() => {
            expect(screen.queryByTestId(visiblePage)).toBeInTheDocument()
          })
        })
      })
    },
  )

  describe('when user is at home page', () => {
    describe('when user clicks to user name in user list', () => {
      it('displays user page', async () => {
        const {user} = await setupAndRenderApp('/')
        const link = await screen.findByText('test user')
        await user.click(link)
        await waitFor(() => {
          expect(screen.queryByTestId('user-page')).toBeInTheDocument()
        })
      })
    })
  })

  describe('when user is at login page', () => {
    describe('when user clicks forgot password link', () => {
      it('displays password reset request page', async () => {
        const {user} = await setupAndRenderApp('/login')
        const link = await screen.findByText('Forgot password?')
        await user.click(link)
        await waitFor(() => {
          expect(screen.queryByTestId('password-reset-request-page')).toBeInTheDocument()
        })
      })
    })
  })

  describe('when logging successful', () => {
    const setupLoggedIn = async () => {
      const {user} = await setupAndRenderApp('/login')
      await user.type(screen.getByLabelText('Email'), 'user1@mail.com')
      await user.type(screen.getByLabelText('Password'), 'P4ssword')
      await user.click(screen.getByRole('button', {name: 'Login'}))
      await screen.findByTestId('home-page')
      return {user}
    }
    it('navigates to home page', async () => {
      const {user} = await setupAndRenderApp('/login')
      await user.type(screen.getByLabelText('Email'), 'user1@mail.com')
      await user.type(screen.getByLabelText('Password'), 'P4ssword')
      await user.click(screen.getByRole('button', {name: 'Login'}))
      await waitFor(() => {
        expect(screen.queryByTestId('home-page')).toBeInTheDocument()
      })
    })

    it('hides Login and Sign Up links', async () => {
      await setupLoggedIn()
      expect(screen.queryByTestId('link-signup-page')).not.toBeInTheDocument()
      expect(screen.queryByTestId('link-login-page')).not.toBeInTheDocument()
    })

    describe('when user clicks My Profile', () => {
      it('displays user page', async () => {
        const {user} = await setupLoggedIn()
        await user.click(screen.queryByTestId('link-my-profile'))
        await screen.findByTestId('user-page')
        expect(router.currentRoute.value.path).toBe('/user/1')
      })

      it('stores logged in state in local storage', async () => {
        await setupLoggedIn()
        const state = JSON.parse(localStorage.getItem('auth'))
        expect(state.id).toBe(1)
        expect(state.username).toBe('user1')
      })
    })
    })
  })
})
