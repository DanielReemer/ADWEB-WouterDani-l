'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../lib/firebase'
import { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null | undefined
  loading: boolean
  error: Error | undefined
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  error: undefined,
})

interface Props {
  children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
  const [user, loading, error] = useAuthState(auth)

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
