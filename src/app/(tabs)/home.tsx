import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'

import { useAuth } from '@/components/AuthProvider'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { signOut } from '@/lib/auth-client'

export default function HomeTab() {
  const router = useRouter()
  const { session, refetch } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = useMemo(() => {
    const userName = session?.user?.name?.trim()
    if (userName) return userName
    return session?.user?.email ?? 'there'
  }, [session?.user?.email, session?.user?.name])

  const onLogout = async () => {
    setError(null)
    setSubmitting(true)
    const { error: signOutError } = await signOut()
    setSubmitting(false)

    if (signOutError) {
      setError(signOutError.message ?? 'Unable to log out right now.')
      return
    }

    await refetch()
    router.replace('/')
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.bgBubbleTop} />
      <View style={styles.bgBubbleBottom} />

      <View style={styles.heroCard}>
        <ThemedText style={styles.eyebrow}>Authenticated Session</ThemedText>
        <ThemedText style={styles.title}>Welcome, {displayName}</ThemedText>
        <ThemedText style={styles.subtitle}>
          You are inside a protected route powered by Better Auth + Expo Router.
        </ThemedText>

        <View style={styles.infoBlock}>
          <ThemedText style={styles.infoLabel}>Signed-in email</ThemedText>
          <ThemedText style={styles.infoValue}>
            {session?.user?.email ?? 'No email found'}
          </ThemedText>
        </View>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <Pressable
          onPress={onLogout}
          disabled={submitting}
          style={[styles.logoutButton, submitting && styles.logoutButtonDisabled]}
        >
          {submitting ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bgBubbleTop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#FFD68A',
    top: -40,
    right: -30,
    opacity: 0.55,
  },
  bgBubbleBottom: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: '#B7D3FF',
    bottom: -90,
    left: -70,
    opacity: 0.45,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EAE4D9',
    shadowColor: '#2F2F2F',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#8A6A37',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#141414',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  infoBlock: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 6,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})
