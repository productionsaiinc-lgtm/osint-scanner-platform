import { createTRPCReact } from '@trpc/react-query'
import { TRPC_URL } from './api-config'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      credentials: 'include', // Include cookies for auth
    }),
  ],
})

