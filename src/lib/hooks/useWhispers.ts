import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Whisper } from '../interfaces'
import { getWhispers } from '../requests'

export const useWhispers = (conversationUuid: string) => {
  const [dataState, setDataState] = useState<Whisper[]>([])

  const getWhispersFn = useCallback(() => getWhispers(conversationUuid), [conversationUuid])
  const { data, refetch } = useQuery(`whispers:${conversationUuid}`, getWhispersFn, { enabled: !!conversationUuid })

  useEffect(() => {
    if (data && data.length > 0) setDataState(data)
  }, [data])

  return { data: dataState, refetch }
}
