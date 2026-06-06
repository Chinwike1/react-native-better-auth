import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import * as SecureStore from 'expo-secure-store'

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH!,
  plugins: [
    expoClient({
      scheme: 'betterauthrn',
      storagePrefix: 'betterauthrn',
      storage: SecureStore,
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
