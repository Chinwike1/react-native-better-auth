import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { authClient } from '@/lib/auth-client'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from './themed-text'

export default function SignOutButton() {
  const theme = useTheme()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSignOut = async () => {
    if (isSubmitting || isSessionPending) return

    try {
      setIsSubmitting(true)
      const { error } = await authClient.signOut()
      if (error) {
        throw new Error('Error signing out: ' + error.message)
      } else {
        router.replace('/')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || isSessionPending

  if (!session) return null

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSignOut}
        accessible={true}
        accessibilityLabel='Sign out'
        accessibilityRole='button'
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        ]}
      >
        <View style={styles.content}>
          <ThemedText style={styles.text}>{isSubmitting ? 'Signing out...' : 'Sign Out'}</ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
