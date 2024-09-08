import {render, router, waitFor} from 'test/helper'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach} from 'vitest'
import Activation from './ActivationView.vue'

const ACTIVATION_URL = '/api/v1/users/:token/active'
const INITIAL_PATH = '/'
const ACTIVATION_TOKENS = ['123', '456']

let requestCounter = 0
let currentActivationToken

const createServer = () =>
  setupServer(
    http.patch(ACTIVATION_URL, ({params}) => {
      requestCounter += 1
      currentActivationToken = params.token
      return HttpResponse.json({})
    }),
  )

const server = createServer()

const resetTestState = () => {
  requestCounter = 0
  currentActivationToken = undefined
  server.resetHandlers()
}

const setupActivation = async (path) => {
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

beforeAll(() => server.listen())
afterAll(() => server.close())
beforeEach(resetTestState)

describe('Activation', () => {
  it('sends activation request to server', async () => {
    await setupActivation(INITIAL_PATH)
    await verifyRequestCounter(1)
  })

  describe.each([{activationToken: '123'}, {activationToken: '456'}])(
    'when token is $activationToken',
    ({activationToken}) => {
      it('sends token in request', async () => {
        await setupActivation(`/activation/${activationToken}`)
        await verifyActivationToken(activationToken)
      })
    },
  )

  describe('when token is changed', () => {
    it('sends request with new token', async () => {
      await setupActivation(`/activation/${ACTIVATION_TOKENS[0]}`)
      await verifyActivationToken(ACTIVATION_TOKENS[0])

      await router.push(`/activation/${ACTIVATION_TOKENS[1]}`)
      await verifyActivationToken(ACTIVATION_TOKENS[1])
    })
  })
})
