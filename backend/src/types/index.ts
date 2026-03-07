import { Request } from 'express'
import { Role } from '@prisma/client'

export interface UserPayload {
  userId: string
  email: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: UserPayload
}

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
}
