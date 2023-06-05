import '../style.css'

import { QueryClient, QueryClientProvider } from 'react-query'

import Greeting from './Greeting'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export default function Index(props: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <Greeting {...props} />
    </QueryClientProvider>
  )
}
