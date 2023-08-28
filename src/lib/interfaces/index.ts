export interface Configuration {
  avatarPath: string
  videoPath: string
  agentName: string
  questions: string[]
  introduction?: string
  disclaimer?: string
  disclaimerPath?: string
  isUseEmbedding?: boolean
  isUseSection?: boolean
  prompt?: { system?: string; user?: string }
}

export interface Talk {
  uuid: string
  role: 'assistant' | 'user'
  content: string
  createdAt: number
  conversationUuid: string
  filename?: string
  parsedContent?: string
}

export interface Whisper extends Talk {
  transcribed?: string
}

export interface Reply extends Talk {
  whisperUuid: string
}

export interface User {
  uuid: string
  email: string
}

export interface Conversation {
  uuid: string
  name: string
  userUuid: string
  createdAt: number
}
