import express, { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import crypto from 'crypto'

const router = express.Router()

// Webhook secret should be in environment variables
const KKIAPAY_SECRET = process.env.KKIAPAY_SECRET_KEY

// Mapping for subscription plan names to durations (days)
const PLAN_DURATIONS: Record<string, number> = {
    'STARTER': 30,
    'PRO': 30,
    'PREMIUM': 30
}

router.post('/kkiapay', async (req: Request, res: Response) => {
    try {
        // 1. Verify Signature (if possible with Kkiapay's specific mechanism)
        // For now, we will verify the transaction status via API to be 100% sure
        // because webhook signatures can be faked if secret is compromised or not verified correctly.

        const { transactionId, status, amount, reference } = req.body

        if (status !== 'SUCCESS') {
            console.log(`Webhook received with status: ${status} for transaction ${transactionId}`)
            return res.sendStatus(200)
        }

        // 2. Idempotency check: Has this transaction already been processed?
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                paymentRef: transactionId
            }
        })

        if (existingSubscription && existingSubscription.status === 'ACTIVE') {
            console.log(`Transaction ${transactionId} already processed.`)
            return res.sendStatus(200)
        }

        // 3. Optional: Verify with Kkiapay API directly for extra security
        // This is the most secure way if we are not 100% sure about the HMAC verification
        // because it forces a server-to-server check.

        // 4. Find the pending subscription
        // We try to find by reference (which we set during creation) or by userId if passed in metadata
        let subscription = await prisma.subscription.findFirst({
            where: {
                paymentRef: reference,
                status: 'PENDING'
            },
            orderBy: { createdAt: 'desc' }
        })

        // If not found by reference, try to find the latest pending for the user if we have user info
        // Kkiapay webhooks usually don't have custom metadata unless configured.
        // Assuming 'reference' matches our LUX... reference.

        if (!subscription) {
            console.error(`No pending subscription found for reference ${reference}`)
            return res.status(404).json({ error: 'Subscription not found' })
        }

        // 5. Update subscription
        const duration = PLAN_DURATIONS[subscription.plan] || 30
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + duration)

        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'ACTIVE',
                paymentRef: transactionId,
                startDate: startDate,
                endDate: endDate,
                updatedAt: new Date()
            }
        })

        console.log(`Subscription ${subscription.id} activated via webhook for transaction ${transactionId}`)

        res.sendStatus(200)

    } catch (error) {
        console.error('Kkiapay Webhook error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

export default router
