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

        if (error || !session) {
          router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        // Get user role from localStorage or database
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          
          // Check if user has required role
          if (allowedRoles.length > 0) {
            const userRole = user.role?.toUpperCase()
            const hasAccess = allowedRoles.some(role => 
              role.toUpperCase() === userRole || 
              (userRole === 'ADMIN' && allowedRoles.includes('admin'))
            )
            
            if (!hasAccess) {
              // Redirect based on user role
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
        } else {
          // Fetch user from database
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, name, role')
            .eq('id', session.user.id)
            .single()

          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData))
            
            if (allowedRoles.length > 0) {
              const userRole = userData.role?.toUpperCase()
              const hasAccess = allowedRoles.some(role => 
                role.toUpperCase() === userRole
              )
              
              if (!hasAccess) {
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
          } else {
            router.push(redirectTo)
          }
        }
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

