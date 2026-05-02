import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

// Always use the tunnel URL for auth (both dev and prod)
const getAuthUrl = () => {
  return (
    Constants.expoConfig?.extra?.apiUrl || 'https://mobile-dev.chinwike.space'
  )
}

export const authClient = createAuthClient({
  baseURL: getAuthUrl(),
  plugins: [
    expoClient({
      scheme: 'betterauthrn',
      storagePrefix: 'betterauthrn',
      storage: SecureStore,
    }),
  ],
})
