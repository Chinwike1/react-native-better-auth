import { authClient } from '@/lib/auth-client'
import * as Device from 'expo-device'
import { Platform, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AnimatedIcon } from '@/components/animated-icon'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { WebBadge } from '@/components/web-badge'
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme'
import { getBaseUrl } from '@/lib/utils'

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type='small'>use browser devtools</ThemedText>
  }
  if (Device.isDevice) {
    return (
      <ThemedText type='small'>
        shake device or press <ThemedText type='code'>m</ThemedText> in terminal
      </ThemedText>
    )
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d'
  return (
    <ThemedText type='small'>
      press <ThemedText type='code'>{shortcut}</ThemedText>
    </ThemedText>
  )
}

console.log('Base URL: ', getBaseUrl())

export default function HomeScreen() {
  const { data: session } = authClient.useSession()

  const title = session?.user ? `Welcome, ${session.user.name.split(' ')[0] ?? session.user.email}` : 'Welcome Back'
  const subtitle = session?.user ? 'You are signed in to your account' : 'Sign in to continue to your account'

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type='title' style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.authContainer}>
          <GoogleSignInButton />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  authContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
})
