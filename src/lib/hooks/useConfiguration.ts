import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Configuration } from '../interfaces'
import { getConfiguration } from '../requests'
import { getIdentifier } from '../utils'

export const useConfiguration = () => {
  const identifier = getIdentifier()
  const [dataState, setDataState] = useState<Configuration>({} as Configuration)

  const rawConfiguration = localStorage.getItem('configuration')

  const getConfigurationFn = useCallback(() => {
    if (rawConfiguration) {
      return JSON.parse(rawConfiguration)
    } else {
      return getConfiguration(identifier)
    }
  }, [identifier, rawConfiguration])

  const { data } = useQuery('configuration', getConfigurationFn, { enabled: !!identifier, cacheTime: 100 })

  useEffect(() => {
    if (data) {
      localStorage.setItem('configuration', JSON.stringify(data))
      setDataState(data)
    }
  }, [data])

  return dataState
}
