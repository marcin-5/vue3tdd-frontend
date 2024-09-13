import {render, router, screen, waitFor} from 'test/helper'
import App from './App.vue'
import {vi} from 'vitest'

vi.mock('@/views/activation/ActivationView.vue')
vi.mock('@/views/home/components/UserList.vue')

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
]

const clickTestCases = [
  {initialPath: '/', clickingTo: 'link-signup-page', visiblePage: 'signup-page'},
  {initialPath: '/signup', clickingTo: 'link-home-page', visiblePage: 'home-page'},
]

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
})
