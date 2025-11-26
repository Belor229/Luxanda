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
  const protectedRoutes = ['/admin', '/vendor/dashboard', '/vendor']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Admin only routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Vendor only routes
  const vendorRoutes = ['/vendor']
  const isVendorRoute = vendorRoutes.some(route => pathname.startsWith(route))

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing admin route, check if user is admin
  if (isAdminRoute && session) {
    // Get user role from cookie or database
    const userStr = request.cookies.get('user')?.value
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role?.toUpperCase() !== 'ADMIN') {
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (e) {
        // If can't parse, allow through and let client-side handle it
      }
    }
  }

  // If accessing vendor route, check if user is vendor
  if (isVendorRoute && session) {
    const userStr = request.cookies.get('user')?.value
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role?.toUpperCase() !== 'VENDOR' && user.role?.toUpperCase() !== 'ADMIN') {
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (e) {
        // If can't parse, allow through and let client-side handle it
      }
    }
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

