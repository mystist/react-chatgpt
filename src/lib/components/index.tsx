import '../style.css'

import { QueryClient, QueryClientProvider } from 'react-query'

import { setHost } from '../requests'
import ReactChatGPTIntegration, { MemoizedOverlay } from './ReactChatGptIntegration'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export default function ReactChatGPT(props: any) {
  const { mode, host, ...rest } = props
  if (host) {
    console.log('host', host)
    setHost(host)
  }
  return <QueryClientProvider client={queryClient}>{mode === 'auto' ? <ReactChatGPTIntegration {...rest} /> : <MemoizedOverlay {...rest} />}</QueryClientProvider>
}

