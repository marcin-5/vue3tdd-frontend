import {ref, watchEffect} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'

export default function useRouteParamApiRequest(apiFn, routeVariable) {
  const STATUS_LOADING = 'loading'
  const STATUS_SUCCESS = 'success'
  const STATUS_FAIL = 'fail'

  const {t} = useI18n()
  const route = useRoute()
  const error = ref()
  const status = ref()
  const data = ref()

  const handleApiRequest = async () => {
    status.value = STATUS_LOADING
    try {
      const response = await apiFn(route.params[routeVariable])
      data.value = response.data
      status.value = STATUS_SUCCESS
    } catch (apiError) {
      status.value = STATUS_FAIL
      error.value = apiError.response?.data?.message || t('genericError')
    }
  }

  watchEffect(handleApiRequest)

  return {status, data, error}
}
