import axios from 'axios'

import { getLang } from '../utils'

export const baseUrl = '/gpt-service'

export const request = axios.create({ baseURL: baseUrl })

export const postWhisper = async ({ blob, conversationUuid }: { blob: Blob; conversationUuid: string }) => {
  const formData = new FormData()
  const fileName = 'voice.wav'
  const lang = getLang()

  const file = new File([blob], fileName)
  formData.append('file', file, fileName)
  formData.append('conversationUuid', conversationUuid)
  if (lang) formData.append('language', getLang())

  const res = await request.post('/api/sentence/inputs/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

  return res.data
}

export const postWhisperByText = async ({ content, conversationUuid }: { content: string; conversationUuid: string }) => {
  const res = await request.post('/api/sentence/inputs/create-by-text', { content, conversationUuid })

  return res.data
}

export const getConfiguration = async (identifier: string) => {
  const lang = getLang()
  const res = await request.get(`/api/configuration?identifier=${identifier}&lang=${lang}`)

  return res.data
}

export const getLatestConversationList = async ({ userUuid, count = 2, isCreate }: any) => {
  const res = await request.get(`/api/conversation/conversations/latest-list?userUuid=${userUuid}&count=${count}&create=${isCreate}`)

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

export const postReply = async ({ conversationUuid, whisperUuid, content, identifier, onMessage, onConversationFull }: any) => {
  const eventSource = new EventSource(`${baseUrl}/api/sentence/outputs/create?conversationUuid=${conversationUuid}&inputUuid=${whisperUuid}&content=${content}&identifier=${identifier}`)

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
