import './style.css'
import './lib/style.css'

import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import { ReactChatGPT } from './lib'

function App() {
  const [status, setStatus] = useState('')

  return (
    <div id="react-chatgpt" className="flex min-h-screen items-center justify-center">
      <div className="max-w-lg text-center">
        <ChatBubbleLeftEllipsisIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <h2 className="mt-2 text-base font-semibold leading-6 text-gray-900">React ChatGPT</h2>
        <p className="mt-1 text-sm text-gray-500">Get started by starting our conversation.</p>

        <div className="mt-6 flex flex-col space-y-3">
          <button className="btn btn-primary" onClick={() => setStatus('start')}>
            <span>Start Conversation</span>
          </button>
          <button className="btn btn-secondary " onClick={() => setStatus('new')}>
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      <ReactChatGPT status={status} setStatus={setStatus} identifier="" />
    </div>
  )
}

export default App
