import { Request, Response } from 'express'

export interface AuthRequest extends Request {
  user?: {
    userId: number
    email: string
    role: string
  }
}

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
}

