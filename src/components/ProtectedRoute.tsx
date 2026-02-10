'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        // Check for session
        if (error || !session) {
          router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        // Fetch user from database to check role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData) {
          console.error('Error fetching user for auth check:', userError)
          router.push(redirectTo)
          return
        }

        // Role-based authorization
        if (allowedRoles.length > 0) {
          const userRole = userData.role?.toUpperCase()
          const hasAccess = allowedRoles.some(role =>
            role.toUpperCase() === userRole ||
            (userRole === 'ADMIN' && allowedRoles.includes('admin'))
          )

          if (!hasAccess) {
            // Redirect based on user role if not authorized for this specific route
            if (userRole === 'ADMIN') {
              router.push('/admin')
            } else if (userRole === 'VENDOR') {
              router.push('/vendor/dashboard')
            } else {
              router.push('/')
            }
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

