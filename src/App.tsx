import { ReactChatGPT } from './lib'

function App() {
  return (
    <div id="react-chatgpt">
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
        <p className="text-purple-500">react-chatgpt</p>

        <ReactChatGPT />
      </div>
    </div>
  )
}

export default App
