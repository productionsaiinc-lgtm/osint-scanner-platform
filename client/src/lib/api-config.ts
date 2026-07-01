// Use Manus backend API
export const API_BASE_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://osintscan-fftqerzj.manus.space/api'
    : 'http://localhost:3000/api'

export const TRPC_URL = 
  process.env.NODE_ENV === 'production'
    ? 'https://osintscan-fftqerzj.manus.space/api/trpc'
    : 'http://localhost:3000/api/trpc'
