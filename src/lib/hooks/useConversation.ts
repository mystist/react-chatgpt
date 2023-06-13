import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Conversation } from '../interfaces'
import { getLatestConversationList } from '../requests'
import { getOrCreateUserUuid } from '../utils'

export const useConversation = ({ isCreate = false } = {}) => {
  const [dataState, setDataState] = useState<Conversation[]>([])

  const userUuid = getOrCreateUserUuid()

  const getLatestConversationFn = useCallback(() => {
    return getLatestConversationList({ userUuid, isCreate })
  }, [isCreate, userUuid])

  const { data, refetch } = useQuery(`conversation:${userUuid}:latest-previous`, getLatestConversationFn, { cacheTime: 100 }) as any

  useEffect(() => {
    if (data) setDataState(data)
  }, [data])

  return { data: dataState, refetch }
}
