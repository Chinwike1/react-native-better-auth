# React Native Authentication with Better Auth

Authentication determines how users enter an app and what they can access. In React Native, it feels simple at first, especially if all you need is email and password. Add OAuth, session persistence, and protected routes, and it gets considerably harder to manage.

That is why third party hosted providers like Clerk are so appealing. They handle the infrastructure upfront. The tradeoff is less control over your auth stack, added cost, and a developer experience that may not fit every product.

Better Auth takes a different approach. It is self-hosted but handles most of the heavy lifting, so you are not building an auth system from scratch. It also has an Expo plugin that makes the mobile setup considerably smoother. In this guide, we will build a working Expo app with email and password authentication, Google OAuth, persistent sessions, and protected routes.

```txt
short mention it's syntax similarity to auth.js and how they took over that maintainance for that project
```

## Prerequisites

To easily follow along, make sure you have the following in place:

- A MongoDB database configured for your Better Auth backend.
- An iOS simulator or Android emulator in that allow you make [development builds](https://docs.expo.dev/develop/development-builds/expo-go-to-dev-build/).
- A Google Cloud project for Google sign-in

## Project Setup

This walkthrough uses Expo SDK 55 with an Android emulator running the development build of the application. Expo Go, on its own, runs your code inside Expo's native shell, so it cannot register the app's custom scheme or support the native modules that the Google OAuth flow depends on.

At the time of writing, Expo Go remains on SDK 54 on the App Store and Play Store while SDK 55 awaits App Store review. You can decide to use Expo Go and SDK 54 by running the command below without the `--template` flag — but you'll only be able to follow the email/password flow.

```bash
npx create-expo-app@latest react-native-better-auth --template default@sdk-55
cd react-native-better-auth
npm install better-auth @better-auth/expo @better-auth/mongo-adapter expo-network expo-secure-store mongodb
```

The earlier command creates a fresh Expo project using `create-expo-app`. SDK 55 has several benefits including the New Architecture being fully supported, performance updates and a compact folder structure using a `/src` directory.

We’ve also installed the libraries we need to get Better Auth to work with Expo:

- `better-auth`: the core auth library
- `@better-auth/expo`: the Expo plugin that handles deep link callbacks and cookie storage for the mobile auth flow
- `@better-auth/mongo-adapter mongodb`: the MongoDB adapter for Better Auth and the MongoDB Node.js driver
- `expo-secure-store`: used by Better Auth's `expoClient()` to persist session tokens securely on the device
- `expo-network`: used internally by the Expo plugin to detect the current network address in development

Note that if you're adding Better Auth to an existing project rather than a default template you would have to install `expo-linking`, `expo-web-browser`, and `expo-constants` as well.

## Setting up Better Auth and the auth config

Better Auth needs a backend to run on and we can take advantage of Expo's API routes. Mount the Better Auth request handlers by creating this file at `src/app/api/[...auth]+api.ts`:

```ts
import { auth } from '@/lib/auth'

const handler = auth.handler

export { handler as GET, handler as POST }
```

Now let's create the main auth configuration located at `src/lib/auth.ts`. This is where we initialize Better Auth using the Expo plugin as well as configuring our database, authentication methods, session storage mechanisms and more:

```ts
import { expo } from '@better-auth/expo'
import { betterAuth } from 'better-auth'
import { mongodbAdapter } from '@better-auth/mongo-adapter'
import { ObjectId } from 'mongodb'
import { dbClient } from './db'

const database = dbClient.db('better-auth')

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [expo()],
  database: mongodbAdapter(database, { client: dbClient }),
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
      // request a refresh token so the server re-authenticates without user interaction
      accessType: 'offline',
      // force account picker + consent screen on every sign-in to ensure a refresh token is returned
      prompt: 'select_account consent',
    },
  },
  trustedOrigins: [
    'betterauthrn://',
    process.env.BETTER_AUTH_URL,
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
```

`BETTER_AUTH_URL` is the public base URL your Better Auth server runs at. Better Auth uses it to construct callback URLs and validate trusted origins. For local development with Google OAuth, this needs to be a publicly reachable HTTPS URL — the OAuth section covers how to get one.

The `advanced.database.generateId` override is needed with the Mongo adapter. Without it, the adapter tries to handle IDs as a buffer, which causes insert failures. Returning `new ObjectId().toHexString()` fixes this.

`storeStateStrategy: 'cookie'` tells better-auth to store the OAuth state parameter in a cookie during the social sign-in flow (instead of the default, which uses the database).

For mobile/Expo apps this is important because the OAuth redirect flow happens in a browser context where cookie-based state is more reliable than trying to look up state from the server mid-redirect. You wouldn't have to bother about this if you're using the [`idToken` google sigin flow](https://better-auth.com/docs/integrations/expo#idtoken-sign-in).

On the client side, `src/lib/auth-client.ts` uses the same base url and hands storage and OAuth redirects to `expoClient()`:

```ts
import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

const getAuthUrl = () => {
  return (
    Constants.expoConfig?.extra?.apiUrl || 'https://devserver.chinwike.space'
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
```

## Environment variables

Create a `.env` file at the root of your project:

```
BETTER_AUTH_URL=https://your-server-url
BETTER_AUTH_SECRET=your-secret
MONGO_URI=your-mongodb-connection-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

`BETTER_AUTH_SECRET` is used to sign sessions and encrypt tokens. Generate a secure value with:

```bash
openssl rand -base64 32
```

Without a stable secret, every server restart invalidates all active sessions.

## Email & Password Authentication

- Signing up and signing in via the Better Auth client
- Handling validation errors and API error states
- Building the login/signup screens

<!-- ## Session Management & Secure Storage

- How `expoClient()` stores Better Auth cookies in `expo-secure-store`
- Why session data survives app reloads
- Session caching on app reload
- Making authenticated requests with `authClient.$fetch()` or `authClient.getCookie()`
- A SecureStore key limitation that may require a custom storage adapter
- Restoring the session on app launch before rendering protected routes -->

## Better Auth social login with Google OAuth

Google sign-in in this app uses Better Auth's browser-based flow. When the user taps a sign-in button, Better Auth opens a browser session, the user authenticates with Google, and Google redirects back to the Better Auth server. The server then redirects the browser to the `betterauthrn://` deep link, which the app intercepts to complete sign-in.

The credential for this is a **Web Application** credential, not an Android credential. The redirect URI — `/api/auth/callback/google` — is handled by your server, so Google needs to be able to reach your server, not the device. Even though the sign-in starts on the emulator, the OAuth handshake happens between Google and your backend.

### Choosing a server URL for local development

Google requires the redirect URI you register to exactly match the one your server sends. This creates a practical problem: you need a publicly reachable HTTPS URL for your local Better Auth server.

You might try pointing `BETTER_AUTH_URL` at `http://localhost:8081`. In a web browser on your machine that works, because the browser follows the redirect directly to your local server. On an Android emulator, it does not — the system browser inside the emulator treats `localhost` as the emulator's own loopback address, not your host machine. So `http://localhost:8081/api/auth/callback/google` leads nowhere.

Expo's `--tunnel` flag is a common workaround:

```bash
npx expo start --tunnel
```

This uses Ngrok to give you a public HTTPS URL that Google can redirect to. However, my problem with this apporoach is that the URL changes every time you restart the dev server, which means you constantly need to update the URIs in Google Cloud Console.

I used [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) instead. Cloudflare Tunnel works by running a lightweight daemon (`cloudflared`) on your machine that opens an outbound connection to Cloudflare's network. You then publish your local server through a subdomain on your own domain, and that subdomain stays fixed regardless of how many times you restart development.

> **Note:** This requires a domain that is managed on Cloudflare. If you do not have one, you can add a domain to your Cloudflare account for free and point its nameservers to Cloudflare.

To set it up, go to the [Cloudflare Zero Trust dashboard](https://dash.cloudflare.com/one/) and follow these steps:

1. Before creating the tunnel, set up a bypass policy so Cloudflare Access does not intercept requests to your tunnel URL with an OTP screen. Go to **Access > Applications**, select **Add an application**, and choose **Self-hosted**. Enter the same subdomain you plan to use (e.g. `devserver.chinwike.space`). Under **Policies**, create a policy with **Action: Bypass** and set the selector to **Everyone**. Save the application. This policy also needs to be positioned first for your tunnel, otherwise every request to your server — including Google's OAuth redirect — will hit the Access login page first.
2. Go to **Networks > Connectors > Cloudflare Tunnels** and select **Create a tunnel**.
3. Choose **Cloudflared** as the connector type and give the tunnel a name.
4. Select **Save tunnel**. The dashboard will generate an install command — copy it and run it in your terminal to install and authenticate `cloudflared` on your machine.
5. Once the connector appears as active, select **Next**.
6. On the **Published applications** tab, enter your subdomain (e.g. `mobile-dev`) and select your domain from the dropdown.
7. Under **Service**, set the type to **HTTP** and the URL to `localhost:8081`.
8. Select **Save**.

![alt text](image-2.png)

Your local server is now reachable at `https://mobile-dev.yourdomain.com` (or whatever subdomain you chose). Set that as `BETTER_AUTH_URL` in your `.env` and as `extra.apiUrl` in `app.json`. You register the redirect URI in Google once and it stays valid for every dev session.

### Registering the OAuth client in Google Cloud

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and select or create a project.
2. Go to **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**.
3. Choose **Web application** as the application type.
4. Under **Authorized JavaScript origins**, add your base url:

```txt
https://devserver.chinwike.space
```

1. Under **Authorized redirect URIs**, add your callback URL:

```txt
https://devserver.chinwike.space/api/auth/callback/google
```

1. Copy the client ID and client secret into your `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## Creating an Android development build

Before testing Google sign-in, you need a native development build of your app installed on the emulator. A development build is compiled from your own project and registers your app's custom scheme with the OS.

Install `expo-dev-client` using the Expo CLI rather than npm directly, so you get the version matched to your SDK:

```bash
npx expo install expo-dev-client
```

Then update `app.json` with your scheme and public auth origin:

```json
{
  "expo": {
    "scheme": "betterauthrn",
    "extra": {
      "apiUrl": "https://subdomain.your-tunnel-url.com"
    }
  }
}
```

The `scheme` registers `betterauthrn://` as a deep link the OS will route to your app. The `extra.apiUrl` value is read at runtime by `auth-client.ts` via `Constants.expoConfig.extra.apiUrl`, keeping the auth client pointed at the right server without hardcoding the URL.

Build and install the app on your connected Android emulator:

```bash
npx expo run:android
# or
npx expo run:ios
```

Once installed, verify the deep link is registered:

```bash
npx uri-scheme open betterauthrn://explore --android
```

If the app opens, the scheme is wired up correctly and Better Auth has a native target to redirect to after OAuth sign-in.

On Windows, Android is the only local emulator option. iOS builds require macOS or a physical device with Apple developer provisioning.

### Testing the sign-in flow

With the dev build running, trigger Google sign-in from your app:

```tsx
import { authClient } from '@/lib/auth-client'

const { error } = await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/explore',
})

if (error) {
  console.log('Sign-in error:', JSON.stringify(error, null, 2))
}
```

The Expo plugin converts the relative `callbackURL` into a full deep link (`betterauthrn:///explore`) before sending it to Better Auth. After Google completes the handshake, it redirects to your server's callback URL. The server exchanges the code for tokens and then redirects the browser to `betterauthrn:///explore`. The app intercepts that URL, `expoClient()` reads the session, and writes it to SecureStore.

The `explore` screen can then read the authenticated session with `authClient.useSession()`.

Better Auth also supports an `idToken` flow for Google, Apple, and Facebook. The browser flow shown here is simpler and does not require any platform-specific native SDK.

## Protected Routes & Auth State

- Building an auth context/provider around authClient.useSession()
- Route-level guards with Expo Router (<Stack.Protected /> and layout-level redirect logic)

## Sign Out & Token Revocation

- Calling authClient.signOut() and clearing local SecureStore state
- Handling session expiry gracefully

## Conclusion

- Recap of the full auth lifecycle
- What Better Auth handles for you vs. what's still your responsibility
