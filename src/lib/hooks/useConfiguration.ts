import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Configuration } from '../interfaces'
import { getConfiguration } from '../requests'
import { getConfig, getIdentifier, setConfig } from '../utils'

export const useConfiguration = () => {
  const identifier = getIdentifier()
  const [dataState, setDataState] = useState<Configuration>({} as Configuration)

  const rawConfiguration = getConfig()

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
      setConfig(JSON.stringify(data))
      setDataState(data)
    }
  }, [data])

  return dataState
}
