export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'visitor' | 'vendor' | 'admin'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  vendorId: number
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  vendorName?: string
  vendorEmail?: string
}

export interface Subscription {
  id: number
  userId: number
  planType: 'starter' | 'pro' | 'premium'
  amount: number
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  paymentMethod: string
  paymentReference?: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject?: string
  message: string
  status: 'new' | 'read' | 'replied'
  createdAt: string
}

export interface Rewards {
  id: number
  userId: number
  points: number
  totalEarned: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface Affiliation {
  id: number
  referrerId: number
  referredId: number
  commissionRate: number
  commissionAmount: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role?: 'visitor' | 'vendor'
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface RegisterResponse {
  message: string
  token: string
  user: User
}

