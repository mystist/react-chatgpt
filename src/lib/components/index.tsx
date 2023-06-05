import '../style.css'

import { QueryClient, QueryClientProvider } from 'react-query'

import SlideOver from './SlideOver'

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
      <SlideOver {...props} />
    </QueryClientProvider>
  )
}
