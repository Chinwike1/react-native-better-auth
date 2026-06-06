import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useSession } from '@/lib/auth-client'

type AuthContextValue = {
  session: ReturnType<typeof useSession>['data']
  isPending: boolean
  isRefetching: boolean
  refetch: ReturnType<typeof useSession>['refetch']
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending, isRefetching, refetch } = useSession()

  const value = useMemo(
    () => ({ session: data, isPending, isRefetching, refetch }),
    [data, isPending, isRefetching, refetch]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
