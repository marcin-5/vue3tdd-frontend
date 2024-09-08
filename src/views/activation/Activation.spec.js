import {render, router, screen, waitFor} from 'test/helper'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach} from 'vitest'
import Activation from './ActivationView.vue'

// Constants
const ACTIVATION_URL = '/api/v1/users/:token/active'
const INITIAL_PATH = '/'
const ACTIVATION_TOKENS = ['123', '456']
const MESSAGES = {
  GENERIC_ERROR: 'Unexpected error occurred, please try again',
  ACTIVATION_FAIL: 'Activation failure',
  ACTIVATION_SUCCESS: 'Account is activated',
}

// State
let requestCounter = 0
let currentActivationToken

// Server setup
const server = setupServer(
  http.patch(ACTIVATION_URL, ({params}) => {
    requestCounter += 1
    currentActivationToken = params.token
    return HttpResponse.json({})
  }),
)

// Helper functions
const resetTestState = () => {
  requestCounter = 0
  currentActivationToken = undefined
  server.resetHandlers()
}

const setupActivation = async (path = '/activation/123') => {
  await router.push(path)
  await router.isReady()
  return render(Activation)
}

const verifyRequestCounter = async (expectedCount) => {
  await waitFor(() => {
    expect(requestCounter).toBe(expectedCount)
  })
}

const verifyActivationToken = async (expectedToken) => {
  await waitFor(() => {
    expect(currentActivationToken).toBe(expectedToken)
  })
}

const mockNetworkError = () => {
  server.use(http.patch(ACTIVATION_URL, () => HttpResponse.error()))
}

const mockResponseMessage = (message, status = 200) => {
  return new Promise((resolve) => {
    server.use(
      http.patch(ACTIVATION_URL, async () => {
        // await new Promise((res) => setTimeout(res, 100))
        resolve()
        return HttpResponse.json({message}, {status})
      }),
    )
  })
}

beforeAll(() => server.listen())
afterAll(() => server.close())
beforeEach(resetTestState)

// Tests
describe('Activation', () => {
  it('sends activation request to server', async () => {
    await setupActivation(INITIAL_PATH)
    await verifyRequestCounter(1)
  })

  describe.each(ACTIVATION_TOKENS)('when token is %s', (token) => {
    it(`sends token ${token} in request`, async () => {
      await setupActivation(`/activation/${token}`)
      await verifyActivationToken(token)
    })
  })
  describe('when token is changed', () => {
    it('sends request with new token', async () => {
      await setupActivation(`/activation/${ACTIVATION_TOKENS[0]}`)
      await verifyActivationToken(ACTIVATION_TOKENS[0])
      await router.push(`/activation/${ACTIVATION_TOKENS[1]}`)
      await verifyActivationToken(ACTIVATION_TOKENS[1])
    })
  })

  describe('when network error occurs', () => {
    it('displays generic error message', async () => {
      mockNetworkError()
      await setupActivation()
      const text = await screen.findByText(MESSAGES.GENERIC_ERROR)
      expect(text).toBeInTheDocument()
    })
  })

  describe('when token is invalid', () => {
    it('displays error message received in response', async () => {
      const resolveMock = mockResponseMessage(MESSAGES.ACTIVATION_FAIL, 400)
      await setupActivation()
      expect(screen.queryByText(MESSAGES.ACTIVATION_FAIL)).not.toBeInTheDocument()
      await resolveMock
      await waitFor(() => {
        expect(screen.queryByText(MESSAGES.ACTIVATION_FAIL)).toBeInTheDocument()
      })
    })
  })

  describe('when token is valid', () => {
    it('displays success message received in response', async () => {
      const resolveMock = mockResponseMessage(MESSAGES.ACTIVATION_SUCCESS)
      await setupActivation()
      expect(screen.queryByText(MESSAGES.ACTIVATION_SUCCESS)).not.toBeInTheDocument()
      await resolveMock
      await waitFor(() => {
        expect(screen.queryByText(MESSAGES.ACTIVATION_SUCCESS)).toBeInTheDocument()
      })
    })

    it('displays spinner', async () => {
      let resolveFunc
      const promise = new Promise((resolve) => {
        resolveFunc = resolve
      })

      server.use(
        http.patch(ACTIVATION_URL, async () => {
          await promise
          return HttpResponse.json({message: MESSAGES.ACTIVATION_SUCCESS})
        }),
      )

      await setupActivation()
      const spinner = await screen.findByRole('status')
      expect(spinner).toBeInTheDocument()
      await resolveFunc()
      await waitFor(() => {
        expect(spinner).not.toBeInTheDocument()
      })
    })
  })
})
