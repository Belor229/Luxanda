import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Endpoint de santé pour UptimeRobot ou autres outils de monitoring
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Luxanda Web App'
  }, { status: 200 })
}
