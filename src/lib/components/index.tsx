import '../style.css'

import { SetStateAction } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { setHost } from '../requests'
import { OverlayProps } from './Overlay'
import ReactChatGPTIntegration, { MemoizedOverlay } from './ReactChatGptIntegration'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export type ReactChatGPTProps = (
  | {
      mode?: never
      status: 'open' | ''
      setStatus: (value: SetStateAction<'open' | ''>) => void
    }
  | {
      mode: 'auto'
      status?: never
      setStatus?: never
    }
) & {
  host?: string
} & Exclude<OverlayProps, 'status' | 'setStatus'>

export default function ReactChatGPT(props: ReactChatGPTProps) {
  const { mode, host, ...rest } = props
  if (host) {
    setHost(host)
  }
  return <QueryClientProvider client={queryClient}>{mode === 'auto' ? <ReactChatGPTIntegration {...rest} /> : <MemoizedOverlay {...rest} />}</QueryClientProvider>
}

