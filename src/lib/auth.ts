import { expo } from '@better-auth/expo'
import { mongodbAdapter } from '@better-auth/mongo-adapter'
import { betterAuth } from 'better-auth'
import { ObjectId } from 'mongodb'
import { dbClient } from './db'

const database = dbClient.db('better-auth')

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [expo()],
  database: mongodbAdapter(database, {
    client: dbClient,
    // disable transactions for standalone MongoDB (e.g. local docker, free-tier Atlas M0)
    // if your deployment supports transactions, set this to true for better consistency
    transaction: false,
  }),
  advanced: {
    database: {
      generateId: () => new ObjectId().toHexString(),
    },
  },
  account: {
    storeStateStrategy: 'cookie',
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      accessType: 'offline',
      prompt: 'select_account consent',
    },
  },
  trustedOrigins: [
    'betterauthrn://',
    process.env.BETTER_AUTH_URL!,
    ...(process.env.NODE_ENV === 'development'
      ? [
          'exp://',
          'exp://**',
          'exp://192.168.*.*:*/**',
          'http://localhost:8081',
        ]
      : []),
  ],
})
