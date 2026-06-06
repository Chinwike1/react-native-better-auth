import React, { useEffect } from 'react'
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuth } from '@/components/AuthProvider'
import SignOutButton from '@/components/sign-out-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { WebBadge } from '@/components/web-badge'
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export default function ProfileTab() {
  const safeAreaInsets = useSafeAreaInsets()
  const { session } = useAuth()
  const theme = useTheme()
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  }

  useEffect(() => {
    if (session) {
      console.log('Authenticated session:', JSON.stringify(session, null, 2))
    }
  }, [session])

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  })

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type='subtitle'>Profile</ThemedText>
          {session?.user ? (
            <ThemedText style={styles.centerText} themeColor='textSecondary'>
              Signed in as {session.user.email ?? session.user.name ?? 'your account'}
            </ThemedText>
          ) : (
            <ThemedText style={styles.centerText} themeColor='textSecondary'>
              Loading profile...
            </ThemedText>
          )}

          {session?.user?.image ? (
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: session.user.image }}
                style={styles.avatar}
                accessibilityLabel={session.user.name ?? 'Profile picture'}
              />
            </View>
          ) : null}

          <SignOutButton />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
})
