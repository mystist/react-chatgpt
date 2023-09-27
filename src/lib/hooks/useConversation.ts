import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Conversation } from '../interfaces'
import { getLatestConversationList } from '../requests'
import { getConversationUuid, getOrCreateUserUuid } from '../utils'

export const useConversation = ({ isCreate = false } = {}) => {
  const [dataState, setDataState] = useState<Conversation[]>([])

  const userUuid = getOrCreateUserUuid()
  const conversationUuid = getConversationUuid()

  const getLatestConversationFn = useCallback(() => {
    return getLatestConversationList({ userUuid, isCreate })
  }, [isCreate, userUuid])

  const { data, refetch } = useQuery(`conversation:${userUuid}:${conversationUuid || 'latest-and-previous'}`, getLatestConversationFn, { cacheTime: 100, enabled: !conversationUuid }) as any

  useEffect(() => {
    if (conversationUuid && userUuid) {
      setDataState([{ uuid: conversationUuid, userUuid, name: 'default-conversation', createdAt: new Date().valueOf() }])
    } else if (data) {
      setDataState(data)
    }

  }, [conversationUuid, data, userUuid])

  return { data: dataState, refetch }
}
