import axios from 'axios'

import { getIdentifier, getLang } from '../utils'

export const baseUrl = '/gpt-service'

export const request = axios.create({ baseURL: baseUrl })
export const requestEmbedding = axios.create({ baseURL: '/embedding-service' })

export const postWhisper = async ({ blob, conversationUuid, chatMode }: { blob: Blob; conversationUuid: string, chatMode: string }) => {
  const formData = new FormData()
  const fileName = 'voice.wav'
  const lang = getLang()

  const file = new File([blob], fileName)
  formData.append('file', file, fileName)
  formData.append('conversationUuid', conversationUuid)
  formData.append('chatMode', chatMode)
  if (lang) formData.append('language', getLang())

  const res = await request.post('/api/sentence/inputs/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

  return res.data
}

export const postWhisperByText = async ({ content, conversationUuid, chatMode }: { content: string; conversationUuid: string, chatMode: string }) => {
  const res = await request.post('/api/sentence/inputs/create-by-text', { content, conversationUuid, chatMode })

  return res.data
}

export const getConfiguration = async (identifier: string) => {
  const lang = getLang()
  const res = await request.get(`/api/configuration?identifier=${identifier}&lang=${lang}`)

  return res.data
}

export const getLatestConversationList = async ({ userUuid, count = 2, isCreate }: any) => {
  const identifier = getIdentifier()

  const res = await request.get(`/api/conversation/conversations/latest-list?userUuid=${userUuid}&identifier=${identifier}&count=${count}&create=${isCreate}`)

  return res.data
}

export const getWhispers = async (conversationUuid: string) => {
  const res = await request.get(`/api/sentence/inputs?conversationUuid=${conversationUuid}`)

  return res.data
}

export const getReplies = async (conversationUuid: string) => {
  const res = await request.get(`/api/sentence/outputs?conversationUuid=${conversationUuid}`)

  return res.data
}

export const postReply = async ({ conversationUuid, whisperUuid, content, identifier, onMessage, onConversationFull, chatMode, userUuid, referenceCodesStr }: any) => {
  const eventSource = new EventSource(`${baseUrl}/api/sentence/outputs/create?conversationUuid=${conversationUuid}&inputUuid=${whisperUuid}&content=${encodeURIComponent(content)}&identifier=${identifier}&chatMode=${chatMode}&clientIdentifier=${userUuid}&referenceCodesStr=${referenceCodesStr}`)

  eventSource.onmessage = (e) => {
    try {
      const data = e.data
      const lines = data.split('\n').filter((line: string) => line.trim() !== '')

      for (const line of lines) {
        const message = line.replace(/^data: /, '')

        if (message === '[DONE]') {
          eventSource.close()
          onMessage({ message: '', isFinish: true })
        } else {
          onMessage({ message: JSON.parse(message), isFinish: false })
        }
      }
    } catch (error) {
      onMessage({ message: null, isFinish: true })
      console.log(error)
      eventSource.close()
    }
  }

  eventSource.onerror = (event: any) => {
    try {
      const { statusCode: rawStatusCode, error: errorMsg } = JSON.parse(event.data)
      const statusCode = +rawStatusCode

      onMessage({ message: statusCode !== 400 ? errorMsg : null, isFinish: true })

      if (statusCode === 400) onConversationFull()

      console.log(`Error: ${errorMsg}`)
    } catch (error) {
      onMessage({ message: null, isFinish: true })
      console.log(error)
    } finally {
      eventSource.close()
    }
  }
}

export const postUpload = async ({ title, file, userCode, clientIdentifier }: any) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  formData.append('userCode', userCode)
  formData.append('clientIdentifier', clientIdentifier)

  const res = await requestEmbedding.post('/embedding/member-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

  return res.data
}

export const getReferences = async ({ identifier, userUuid }: any) => {
  const res = await requestEmbedding.get(`/reference/member-references?userCode=${identifier}&clientIdentifier=${userUuid}`)

  return res.data
}

export const postSection = async ({ code, identifier, userUuid }: any) => {
  const res = await requestEmbedding.post('/embedding/member-section', { code, identifier, clientIdentifier: userUuid }, { timeout: 30 * 60 * 1000 })

  return res.data
}

export const deleteReference = async ({ code, userUuid }: any) => {
  const res = await requestEmbedding.delete(`/reference/member-references?code=${code}&clientIdentifier=${userUuid}`)

  return res.data
}
