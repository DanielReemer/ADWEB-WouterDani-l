'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Loading from '@/components/loading'

const PUBLIC_ROUTES = ['/login', '/register']

interface Props {
  children: ReactNode
}

export default function AuthGuard({ children }: Props) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    if (!user && !isPublicRoute) {
      router.replace('/login')
    } else if (user && isPublicRoute) {
      router.replace('/')
    }
  }, [user, loading, pathname, router])

  if (loading) return <Loading />

  if (!loading) {
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    if (!user && !isPublicRoute) return <Loading />
    if (user && isPublicRoute) return <Loading />
  }

  return <>{children}</>
}
