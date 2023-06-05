import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { Conversation } from '../interfaces'
import { getConversation, postConversation } from '../requests'

export const useConversation = ({ userUuid, uuid } = { userUuid: 'default_user_uuid', uuid: '' }) => {
  const [dataState, setDataState] = useState<Conversation | null>(null)

  const uuidValue = uuid || localStorage.getItem('conversationUuid') || ''

  const getConversationFn = useCallback(() => {
    if (uuidValue) {
      return getConversation({ userUuid, uuid: uuidValue })
    } else {
      return postConversation(userUuid)
    }
  }, [userUuid, uuidValue])

  const { data } = useQuery(`conversation:${userUuid}:${uuid}`, getConversationFn, { cacheTime: 100 }) as any

  useEffect(() => {
    if (data) {
      localStorage.setItem('conversationUuid', data.uuid)
      setDataState(data)
    }
  }, [data])

  return dataState
}
