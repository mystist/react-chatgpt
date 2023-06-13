import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Reply } from '../interfaces'
import { getReplies } from '../requests'

export const useReplies = (conversationUuid: string) => {
  const [dataState, setDataState] = useState<Reply[]>([])

  const getRepliesFn = useCallback(() => getReplies(conversationUuid), [conversationUuid])
  const { data, refetch } = useQuery(`replies:${conversationUuid}`, getRepliesFn, { enabled: !!conversationUuid })

  useEffect(() => {
    if (data) setDataState(data)
  }, [data])

  return { data: dataState, refetch }
}
