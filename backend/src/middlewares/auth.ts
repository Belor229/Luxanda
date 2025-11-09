import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: {
    userId: number
    email: string
    role: string
  }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'Token d\'accès requis'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'LuxandaSecretKey2025', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        error: 'Token invalide ou expiré'
      })
    }

    req.user = user
    next()
  })
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Accès administrateur requis'
    })
  }
  next()
}

export const requireVendor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'vendor' && req.user.role !== 'admin')) {
    return res.status(403).json({
      error: 'Accès vendeur requis'
    })
  }
  next()
}
