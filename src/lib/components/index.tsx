import '../style.css'

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

export default function Index(props: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <Overlay {...props} />
    </QueryClientProvider>
  )
}
