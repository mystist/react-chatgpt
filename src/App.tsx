import './style.css'
import './lib/style.css'

import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import { ReactChatGPT } from './lib'

function App() {
  const [status, setStatus] = useState('')

  return (
    <div id="react-chatgpt" className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-lg flex-col items-center text-center">
        <ChatBubbleLeftEllipsisIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <h2 className="mt-2 text-base font-semibold leading-6 text-gray-900">React ChatGPT</h2>
        <p className="mt-1 text-sm text-gray-500">Get started by starting our conversation</p>

        <div className="mt-5 flex w-fit flex-col space-y-3">
          <button className="btn btn-primary px-10" onClick={() => setStatus('open')}>
            <span>Start Conversation</span>
          </button>
        </div>
      </div>

      <ReactChatGPT status={status} setStatus={setStatus} identifier={import.meta.env.VITE_IDENTIFIER} lang={import.meta.env.VITE_LANG} userUuid={import.meta.env.VITE_USER_UUID} overlayMode="auto" />
    </div>
  )
}

export default App
