'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Store, Gift } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

import { Suspense } from 'react'

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'visitor',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [referrerId, setReferrerId] = useState<string | null>(null)

  const router = useRouter()

  const validateRedirectPath = (path: string) => {
    if (!path || typeof path !== 'string') return '/'
    if (path.startsWith('/') && !path.startsWith('//')) {
      return path
    }
    return '/'
  }
  const searchParams = useSearchParams()

  const isVendor = formData.role === 'vendor'

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferrerId(ref)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true)
      setError('')
      const supabase = createClient()

      const role = isVendor ? 'VENDOR' : 'USER'
      const redirectTo = `${window.location.origin}/api/auth/callback?role=${role}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        setError('Erreur lors de l\'inscription avec Google. Veuillez réessayer.')
        setGoogleLoading(false)
      }
    } catch (err) {
      setError('Erreur de connexion avec Google.')
      setGoogleLoading(false)
    }
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return false
    }
    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('firstName', formData.firstName)
      form.append('lastName', formData.lastName)
      form.append('email', formData.email)
      form.append('password', formData.password)
      form.append('role', formData.role)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: form,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)

        // Create referral if referrer exists
        if (referrerId && data.user.id) {
          try {
            await fetch('/api/affiliation/create-referral', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                referrer_id: referrerId,
                referred_id: data.user.id,
                commission_rate: 30.00
              })
            })
          } catch (error) {
            console.error('Referral creation error:', error)
          }
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          const redirectPath = validateRedirectPath(data.redirectPath ||
            (data.user.role === 'ADMIN' || data.user.role === 'admin' ? '/admin' :
              data.user.role === 'VENDOR' || data.user.role === 'vendor' ? '/vendor/dashboard' : '/'))
          router.push(redirectPath)
          router.refresh()
        }, 2000)
      } else {
        setError(data.error || 'Erreur lors de la création du compte')
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-orange flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Compte créé avec succès !
            </h2>
            <p className="text-gray-600 mb-6">
              {isVendor
                ? 'Votre compte vendeur a été créé. Complétez votre profil boutique pour soumettre votre candidature à la validation.'
                : 'Votre compte a été créé. Vous allez être redirigé dans quelques secondes...'}
            </p>
            <div className="loading-spinner mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-orange flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Créer un compte
            </h2>
            <p className="text-gray-600">
              Rejoignez la communauté Luxanda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Role Selection — Before anything else */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Je souhaite m'inscrire en tant que :
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'visitor' })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  !isVendor
                    ? 'border-primary-orange bg-orange-50 text-primary-orange'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <User className={`h-6 w-6 mx-auto mb-2 ${!isVendor ? 'text-primary-orange' : 'text-gray-400'}`} />
                <span className="text-sm font-bold">Acheteur</span>
                <p className="text-xs text-gray-400 mt-1">Acheter des produits</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'vendor' })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  isVendor
                    ? 'border-primary-orange bg-orange-50 text-primary-orange'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Store className={`h-6 w-6 mx-auto mb-2 ${isVendor ? 'text-primary-orange' : 'text-gray-400'}`} />
                <span className="text-sm font-bold">Vendeur</span>
                <p className="text-xs text-gray-400 mt-1">Vendre des produits</p>
              </button>
            </div>
          </div>

          {/* Vendor Trial Badge */}
          {isVendor && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl flex items-center gap-3">
              <Gift className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-green-800">
                🎁 14 jours d'essai gratuit après validation du profil !
              </p>
            </div>
          )}

          {/* Google Sign Up */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>S'inscrire avec Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400 font-medium">ou</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                    placeholder="Confirmer votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="h-4 w-4 text-primary-orange focus:ring-primary-orange border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary-orange hover:text-orange-600">CGU</Link>, la{' '}
                <Link href="/privacy" className="text-primary-orange hover:text-orange-600">Politique de confidentialité</Link>, la{' '}
                <Link href="/politique-anti-fraude" className="text-primary-orange hover:text-orange-600">Politique anti-fraude</Link>
                {isVendor && (
                  <>
                    {' '}et la{' '}
                    <Link href="/charte-vendeur" className="text-primary-orange hover:text-orange-600">Charte Vendeur</Link>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 min-h-[52px]"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <span>{isVendor ? 'Créer mon compte vendeur' : 'Créer mon compte'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-primary-orange hover:text-orange-600 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-orange flex items-center justify-center">
        <div className="loading-spinner-large"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
