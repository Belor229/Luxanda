declare module 'express-validator' {
  export function body(field: string): any
  export function validationResult(req: any): any
  export function param(field: string): any
  export function query(field: string): any
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        email: string
        role: string
      }
    }
  }
}