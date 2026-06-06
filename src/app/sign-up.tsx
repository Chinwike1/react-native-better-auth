import { Redirect, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '@/components/AuthProvider'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { MaxContentWidth, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { signUp } from '@/lib/auth-client'

export default function SignUpScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { session, isPending, refetch } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isPending && session) {
    return <Redirect href='/home' />
  }

  const onSubmit = async () => {
    setFormError(null)
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!normalizedEmail || !password || !trimmedName) {
      setFormError('Name, email, and password are required.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error } = await signUp.email({
      name: trimmedName,
      email: normalizedEmail,
      password,
    })
    setSubmitting(false)

    if (error) {
      setFormError(error.message ?? 'Unable to sign up. Please try again.')
      return
    }

    await refetch()
    router.replace('/home')
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.backgroundSelected,
      color: theme.text,
    },
  ]

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type='title' style={styles.title}>
            Create account
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign up with email and password.
          </ThemedText>

          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize='words'
            placeholder='Full name'
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            autoComplete='email'
            keyboardType='email-address'
            placeholder='Email'
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize='none'
            secureTextEntry
            placeholder='Password'
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize='none'
            secureTextEntry
            placeholder='Confirm password'
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />

          {formError ? (
            <ThemedText style={styles.error}>{formError}</ThemedText>
          ) : null}

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={[styles.button, submitting && styles.buttonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <ThemedText style={styles.buttonText}>Create Account</ThemedText>
            )}
          </Pressable>

          <ThemedText style={styles.switchText}>
            Already have an account?{' '}
            <ThemedText
              style={styles.switchLink}
              onPress={() => router.back()}
            >
              Sign in
            </ThemedText>
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    opacity: 0.6,
    marginBottom: Spacing.two,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: {
    color: '#b91c1c',
    fontSize: 13,
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginTop: Spacing.one,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
    marginTop: Spacing.one,
  },
  switchLink: {
    fontWeight: '600',
    opacity: 1,
    textDecorationLine: 'underline',
  },
})
