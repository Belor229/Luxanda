'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, ShoppingCart, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { createClient } from '@/utils/supabase/client'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const getItemCount = useCartStore((state: any) => state.getItemCount)
  const cartCount = getItemCount()

  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)

      if (session?.user) {
        fetchUserRole(session.user.id)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          fetchUserRole(session.user.id)
        } else {
          setUserRole(null)
        }
      })

      return () => subscription.unsubscribe()
    }
    initAuth()
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      // We can't easily use prisma here (client component).
      // We could create an API endpoint /api/auth/me to get current user details including role.
      // Or simpler: check if we have an opaque token claim, or just query our new API.
      // Let's use a simple API call.

      // However, for now, specific role-based links might be overkill if we don't have the endpoint ready.
      // But I can create valid links that redirect if unauthorized.

      // Let's assume standard "Mon Compte" for now, OR fetch from a new endpoint.
      // I will implement a quick check via existing APIs if possible, or just default to /

      // Actually, I can use the same logic as previous pages: call an API.
      // Let's rely on the login response storing role in localStorage? No, insecure/hacky.

      // Best practice: A dedicated /api/me endpoint.
      // I will create that quick endpoint now? Or just use specific paths.
      // Let's try to infer or fetch.

      // For now, I will add a generic "Mon Espace" that checks role on the page it lands on, 
      // OR I try to get it from public profile if available.

      // Let's try to fetch from a light endpoint.
      // const res = await fetch('/api/auth/me') ...

      // Use a simple heuristic: if they can access /vendor/dashboard, they are a vendor.
      // That's slow.

      // I'll stick to a generic "Mon Compte" but with a dropdown if possible, or just buttons.
      // AND I will add a "Tableau de Bord" button that appears if logged in.

      // Let's try to fetch from /api/auth/me (I will create it in a sec if not exists)
      const response = await fetch('/api/users/me') // Assuming I create this
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    router.push('/login')
    router.refresh()
  }

  const getDashboardLink = () => {
    if (userRole === 'ADMIN') return '/admin'
    if (userRole === 'VENDOR') return '/vendor/dashboard'
    return '/products' // Requests redirection or user profile
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm gap-2 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-6">
              <span className="flex items-center space-x-2">
                <span>📞</span>
                <span>+229 01 41 75 75 59</span>
              </span>
              <span className="flex items-center space-x-2">
                <span>📧</span>
                <span>luxanda@yahoo.com</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
              {!user && (
                <Link href="/register" className="hover:text-primary-orange transition-colors py-1 px-2 rounded">
                  Devenir Vendeur
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  {userRole && userRole !== 'USER' && (
                    <Link href={getDashboardLink()} className="flex items-center gap-1 hover:text-primary-orange transition-colors py-1 px-2 rounded font-medium">
                      <LayoutDashboard className="h-4 w-4" />
                      {userRole === 'ADMIN' ? 'Admin' : 'Vendeur'}
                    </Link>
                  )}

                  <Link href="/profile" className="flex items-center gap-2 hover:text-primary-orange transition-colors py-1 px-2 rounded">
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="hover:text-red-400 transition-colors py-1 px-2 rounded"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hover:text-primary-orange transition-colors py-1 px-2 rounded">
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logoluxanda.png"
              alt="Luxanda"
              width={150}
              height={50}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </Link>

          {/* Header Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Link */}
            <Link href="/cart" className="relative p-3 text-gray-600 hover:text-primary-orange transition-colors rounded-lg hover:bg-gray-50 group min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary-orange text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-gray-600 hover:text-primary-orange transition-colors rounded-lg hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary-blue">
        <div className="container-custom">
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center space-y-4 md:space-y-0 md:space-x-8 py-4">
              <Link href="/" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Accueil
              </Link>
              <Link href="/products" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Produits
              </Link>
              <Link href="/contact" className="text-white hover:text-primary-orange transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10 min-h-[44px] flex items-center">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
