import { useAuth } from '@/context/AuthContext'
import { User } from 'firebase/auth'

export function useRequireUser(): User {
  const { user, loading } = useAuth()
  if (loading) throw new Error('User is loading')
  if (!user) throw new Error('User is not authenticated')
  return user
}