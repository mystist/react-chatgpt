import '../style.css'

import { memo } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import Overlay from './Overlay'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

const MemoizedOverlay = memo(Overlay)

export default function Index(props: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoizedOverlay {...props} />
    </QueryClientProvider>
  )
}
