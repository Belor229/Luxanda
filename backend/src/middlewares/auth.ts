import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]

  // If no auth header, try to get token from cookies (proxied by Next.js)
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    // Look for supbase auth cookie. The name might vary based on your supabase config, 
    // but typically it starts with 'sb-' followed by the project ref
    const sbTokenKey = Object.keys(cookies).find(k => k.includes('access-token'))
    if (sbTokenKey) token = cookies[sbTokenKey]
  }

  if (!token) {
    return res.status(401).json({
      error: 'Token d\'accès requis'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: Error | null, user: unknown) => {
    if (err) {
      return res.status(403).json({
        error: 'Token invalide ou expiré'
      })
    }

    req.user = user as AuthRequest['user']
    next()
  })
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Accès administrateur requis'
    })
  }
  next()
}

export const requireVendor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({
      error: 'Accès vendeur requis'
    })
  }
  next()
}
