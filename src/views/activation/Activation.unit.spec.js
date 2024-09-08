import {beforeEach, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/vue'
import Activation from './ActivationView.vue'
import {useI18n} from 'vue-i18n'
import en from '@/locales/translations/en.json'
import {activate} from './api'
import {useRoute} from 'vue-router'
import {reactive} from 'vue'

const setupMocks = () => {
  vi.mock('./api')
  vi.mock('vue-i18n')
  vi.mock('vue-router')
  vi.mocked(useI18n).mockReturnValue({t: (key) => en[key]})
  vi.mocked(useRoute).mockReturnValue({params: {token: '123'}})
}

beforeEach(() => {
  vi.clearAllMocks()
  setupMocks()
})

const renderComponent = async (token = '123') => {
  const route = reactive({params: {token}})
  return render(Activation, {
    global: {mocks: {$t: (key) => en[key], $route: route}},
  })
}

describe('Activation', () => {
  it('sends activation request to server', async () => {
    await renderComponent('/')
    await waitFor(() => {
      expect(activate).toHaveBeenCalledTimes(1)
    })
  })

  describe.each([{activationToken: '123'}, {activationToken: '456'}])(
    'when token is $activationToken',
    ({activationToken}) => {
      it('sends token in request', async () => {
        vi.mocked(useRoute).mockReturnValue({params: {token: activationToken}})
        await renderComponent(activationToken)
        await waitFor(() => {
          expect(activate).toHaveBeenCalledWith(activationToken)
        })
      })
    },
  )

  describe('when token is changed', () => {
    it('sends request with new token', async () => {
      const route = reactive({params: {token: '123'}})
      vi.mocked(useRoute).mockReturnValue(route)
      await renderComponent('123')
      await waitFor(() => {
        expect(activate).toHaveBeenCalledWith('123')
      })
      route.params.token = '456'
      await waitFor(() => {
        expect(activate).toHaveBeenCalledWith('456')
      })
    })
  })

  describe('when network error occurs', () => {
    const errorMessage = 'Unexpected error occurred, please try again'
    it('displays generic error message', async () => {
      activate.mockRejectedValue({})
      await renderComponent('/activation/123')
      const text = await screen.findByText(errorMessage)
      expect(text).toBeInTheDocument()
    })
  })

  describe('when token is invalid', () => {
    it('displays error message received in response', async () => {
      let rejectFunction
      activate.mockImplementation(
        () =>
          new Promise((reject) => {
            rejectFunction = reject
          }),
      )
      await renderComponent()
      expect(screen.queryByText('Activation failure')).not.toBeInTheDocument()
      await rejectFunction({data: {message: 'Activation failure'}})
      await waitFor(() => {
        expect(screen.queryByText('Activation failure')).toBeInTheDocument()
      })
    })
  })

  describe('when token is valid', () => {
    const successMessage = 'Account is activated'
    it('displays success message received in response', async () => {
      let resolveFunction
      activate.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFunction = resolve
          }),
      )
      await renderComponent()
      expect(screen.queryByText(successMessage)).not.toBeInTheDocument()
      resolveFunction({data: {message: successMessage}})
      await waitFor(() => {
        expect(screen.queryByText(successMessage)).toBeInTheDocument()
      })
    })
  })

  it('displays spinner', async () => {
    let resolveFunction
    activate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFunction = resolve
        }),
    )
    await renderComponent()
    const spinner = await screen.findByRole('status')
    expect(spinner).toBeInTheDocument()
    resolveFunction({data: {message: 'Account is activated'}})
    await waitFor(() => {
      expect(spinner).not.toBeInTheDocument()
    })
  })
})
