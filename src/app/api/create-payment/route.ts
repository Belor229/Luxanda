import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const GENIUS_PAY_API = 'https://pay.genius.ci/api/v1/merchant'
const GENIUS_PAY_SECRET = process.env.GENIUS_PAY_SECRET_KEY || 'sk_sandbox_9802e5a024746acbecf87c0bc744961d0a24b4f3d60b57ea3f9ca68b6cdb587a'

const paymentSchema = z.object({
    plan: z.enum(['STARTER', 'PRO', 'PREMIUM']),
    amount: z.number().positive(),
    vendorId: z.string().uuid()
})

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const { plan, amount, vendorId } = paymentSchema.parse(body)

        // 1. Create a pending transaction in our DB
        const transaction = await prisma.financeTransaction.create({
            data: {
                userId: authUser.id,
                amount,
                status: 'PENDING',
                provider: 'genius_pay',
                reference: `GEN-${Date.now()}-${Math.random().toString(36).substring(7)}`
            }
        })

        // 2. Prepare Genius Pay request
        const payload = {
            amount,
            currency: 'XOF',
            description: `Abonnement Luxanda - Pack ${plan}`,
            order_id: transaction.id,
            customer_email: authUser.email,
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/genius-pay`,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/vendors?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/vendors?payment=cancel`,
            meta: {
                vendor_id: vendorId,
                plan: plan,
                transaction_id: transaction.id
            }
        }

        const response = await fetch(`${GENIUS_PAY_API}/pay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GENIUS_PAY_SECRET}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Genius Pay Error:', data)
            return NextResponse.json({ error: 'Erreur Genius Pay', details: data }, { status: 500 })
        }

        if (data.transaction_token || data.payment_url) {
             await prisma.financeTransaction.update({
                where: { id: transaction.id },
                data: { reference: data.transaction_id || transaction.reference }
            })
        }

        return NextResponse.json({ 
            payment_url: data.payment_url || data.url,
            transaction_id: transaction.id 
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 })
        }
        console.error('Payment creation error:', error)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
    }
}
