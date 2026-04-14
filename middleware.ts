import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/admin', '/vendor', '/account']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && pathname !== '/admin/login'

  // Admin only routes
  const isAdminRoute = pathname.startsWith('/admin')
  // Seller only routes
  const isSellerRoute = pathname.startsWith('/vendor')

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone()
    if (isAdminRoute) {
      redirectUrl.pathname = '/admin/login'
    } else {
      redirectUrl.pathname = '/login'
    }
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Role verification from database
  if (session) {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const roleFromProfile = profile?.role?.toUpperCase?.()
      const roleFromMetadata = String(session.user.user_metadata?.role || '').toUpperCase()
      const role = roleFromProfile || roleFromMetadata || 'USER'

      if (error || !profile) {
        console.error('Middleware: Profile fallback to metadata role:', error)
      }

        // Admin access control
        if (isAdminRoute && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/', request.url))
        }

        // Isolate Admin from viewing public homepage
        if (role === 'ADMIN' && pathname === '/') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }

        // Seller access control
        if (isSellerRoute && role !== 'VENDOR' && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/', request.url))
        }

      // CGU Acceptance check
      if (isSellerRoute && pathname !== '/vendor/subscription') {
        await supabase
          .from('legal_acceptance_logs')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)
          .single()
      }
    } catch (e) {
      console.error('Middleware: Unexpected error:', e)
      if (isAdminRoute || isSellerRoute) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Admin login route isolation
  if (pathname === '/admin/login' && session) {
      return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse

}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

