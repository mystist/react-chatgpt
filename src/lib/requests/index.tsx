import axios from 'axios'

export const baseUrl = '/gpt-service'
export const model = 'gpt-3.5-turbo'

export const request = axios.create({ baseURL: baseUrl })

export const postWhisper = async ({ blob, conversationUuid }: { blob: Blob; conversationUuid: string }) => {
  const formData = new FormData()
  const fileName = 'voice.wav'

  const file = new File([blob], fileName)
  formData.append('file', file, fileName)
  formData.append('conversationUuid', conversationUuid)

  const res = await request.post('/api/sentence/inputs/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

  return res.data
}

export const postWhisperByText = async ({ content, conversationUuid }: { content: string; conversationUuid: string }) => {
  const res = await request.post('/api/sentence/inputs/create-by-text', { content, conversationUuid })

  return res.data
}

export const getConfiguration = async (identifier: string) => {
  const res = await request.get(`/api/configuration?identifier=${identifier}`)

  return res.data
}

export const getConversation = async ({ userUuid, uuid }: { userUuid: string; uuid: string }) => {
  const res = await request.get(`/api/conversation/conversations/${uuid}?userUuid=${userUuid}`)

  return res.data
}

export const postConversation = async (userUuid: string) => {
  const res = await request.post('/api/conversation/conversations/create', { userUuid })

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
  const eventSource = new EventSource(`${baseUrl}/api/sentence/outputs/create?conversationUuid=${conversationUuid}&inputUuid=${whisperUuid}&content=${content}&identifier=${identifier}&model=${model}`)

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

      onMessage({ message: statusCode === 403 ? errorMsg : null, isFinish: true })

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
