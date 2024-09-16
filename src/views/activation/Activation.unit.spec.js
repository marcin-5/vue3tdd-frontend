import {beforeEach, vi} from 'vitest'
import {render, screen} from '@testing-library/vue'
import Activation from './ActivationView.vue'
import {activate} from './api'
import useRouteParamApiRequest from '@/shared/useRouteParamApiRequest'

const LOADING_STATUS = 'loading'

vi.mock('./api')
vi.mock('@/shared/useRouteParamApiRequest.js')

const mockUseRouteParamApiRequest = vi.mocked(useRouteParamApiRequest)
const setupApiMocks = () => {
  mockUseRouteParamApiRequest.mockReturnValue({
    status: LOADING_STATUS,
    data: undefined,
    error: undefined,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  setupApiMocks()
})

describe('Activation', () => {
  it('calls useRouteParamApiRequest with expected params', () => {
    render(Activation)
    expect(useRouteParamApiRequest).toHaveBeenCalledWith(activate, 'token')
  })

  describe('when status is loading', () => {
    it('displays spinner', () => {
      render(Activation)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('when status is success', () => {
    it('displays data message', () => {
      mockUseRouteParamApiRequest.mockReturnValue({
        status: 'success',
        data: {message: 'Success!!'},
        error: undefined,
      })
      render(Activation)
      expect(screen.getByText('Success!!')).toBeInTheDocument()
    })
  })

  describe('when status is fail', () => {
    it('displays data message', () => {
      mockUseRouteParamApiRequest.mockReturnValue({
        status: 'fail',
        data: undefined,
        error: 'Error occured',
      })
      render(Activation)
      expect(screen.getByText('Error occured')).toBeInTheDocument()
    })
  })
})
