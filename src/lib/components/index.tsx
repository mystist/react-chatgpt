import '../style.css'

import { QueryClient, QueryClientProvider } from 'react-query'

import { setHost } from '../requests'
import ReactChatGPTIntegration, { MemoizedOverlay, ReactChatGPTIntegrationProps } from './ReactChatGptIntegration'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export interface ReactChatGPTProps extends ReactChatGPTIntegrationProps {
  mode?: 'startWithAvatar'
  host?: string
}

export default function ReactChatGPT(props: ReactChatGPTProps) {
  const { mode, host, ...rest } = props
  if (host) {
    console.log('host', host)
    setHost(host)
  }
  return <QueryClientProvider client={queryClient}>{mode === 'startWithAvatar' ? <ReactChatGPTIntegration {...rest} /> : <MemoizedOverlay {...rest} />}</QueryClientProvider>
}

