import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        
        console.log('Genius Pay Webhook received:', JSON.stringify(body))

        const transactionId = body.order_id || body.meta?.transaction_id
        const geniusTransactionId = body.transaction_id || body.id

        if (!transactionId) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 })
        }

        const localTransaction = await prisma.financeTransaction.findUnique({
            where: { id: transactionId },
            include: { user: { include: { vendor: true } } }
        })

        if (!localTransaction) {
            console.error('Transaction not found:', transactionId)
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        const isSuccess = body.status === 'SUCCESS' || body.status === 'PAID'
        
        await prisma.financeTransaction.update({
            where: { id: transactionId },
            data: { 
                status: isSuccess ? 'SUCCESS' : 'FAILED',
                reference: geniusTransactionId || localTransaction.reference
            }
        })

        if (isSuccess) {
            const plan = body.meta?.plan || 'STARTER'
            const vendorId = body.meta?.vendor_id

            const durationDays = 30
            const startDate = new Date()
            const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)

            await prisma.subscription.create({
                data: {
                    userId: localTransaction.userId,
                    vendorId: vendorId,
                    plan: plan,
                    amount: localTransaction.amount,
                    status: 'ACTIVE',
                    paymentRef: geniusTransactionId,
                    startDate,
                    endDate,
                    transactionId: localTransaction.id
                }
            })

            if (vendorId) {
                await prisma.vendor.update({
                    where: { id: vendorId },
                    data: { 
                        status: 'APPROVED',
                        activationConfirmedAt: new Date()
                    }
                })
            }
        }

        return NextResponse.json({ status: 'ok' })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
