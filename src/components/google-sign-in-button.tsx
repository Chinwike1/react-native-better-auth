import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { authClient } from '@/lib/auth-client'
import { useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'
import Svg, { G, Path } from 'react-native-svg'
import { ThemedText } from './themed-text'

export function GoogleSignInButton() {
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

  const handleSignIn = async () => {
    if (isSubmitting || isSessionPending) {
      return
    }

    try {
      setIsSubmitting(true)

      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/home',
      })

      if (error) {
        console.log('Error from Google:', JSON.stringify(error, null, 2))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || isSessionPending

  if (session?.user) return null

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
        onPress={handleSignIn}
        accessible={true}
        accessibilityLabel='Sign in with Google'
        accessibilityRole='button'
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <GoogleLogo />
          </View>
          <ThemedText style={styles.text}>
            {isSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  )
}

function GoogleLogo() {
  return (
    <Svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
      <G>
        <Path
          d='M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z'
          fill='#4285F4'
        />
        <Path
          d='M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z'
          fill='#34A853'
        />
        <Path
          d='M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z'
          fill='#FBBC05'
        />
        <Path
          d='M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z'
          fill='#EA4335'
        />
      </G>
    </Svg>
  )
}

const styles = StyleSheet.create({
  button: {
    // Minimum touch target: 48dp (Android) / 44pt (iOS)
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
  logoContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
