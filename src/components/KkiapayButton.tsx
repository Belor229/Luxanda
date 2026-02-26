'use client'

import { useEffect } from 'react'

interface KkiapayProps {
    amount: number
    callback: (response: any) => void
    data?: any
    theme?: string
    sandbox?: boolean,
    key?: string
}

declare global {
    interface Window {
        openKkiapayWidget: (config: any) => void
        addKkiapayListener: (event: string, callback: (response: any) => void) => void
        removeKkiapayListener: (event: string) => void
    }
}

export default function KkiapayButton({ amount, callback, data }: KkiapayProps) {
    // This is a simplified integration. Ideally use a library or the official snippet properly.
    // For Vercel deployment, we need the public key in env vars.
    const PUBLIC_KEY = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY!

    useEffect(() => {
        const script = document.createElement('script')
        script.src = "https://cdn.kkiapay.me/k.js"
        script.async = true
        document.body.appendChild(script)

        const successHandler = (response: any) => {
            callback(response)
        }

        window.addKkiapayListener?.('success', successHandler)

        return () => {
            document.body.removeChild(script)
            window.removeKkiapayListener?.('success') // Hypothetical cleanup
        }
    }, [callback])

    const handlePayment = () => {
        if (window.openKkiapayWidget) {
            window.openKkiapayWidget({
                amount: amount,
                api_key: PUBLIC_KEY,
                sandbox: true, // Set to false in production
                email: "buyer@example.com", // Optional, prefill if known
                phone: "97000000", // Optional
                data: data // Custom data passed back in webhook/callback
            })
        } else {
            alert("Le module de paiement charge encore, veuillez réessayer dans quelques secondes.")
        }
    }

    return (
        <button
            onClick={handlePayment}
            className="w-full btn btn-primary flex justify-center items-center py-3 text-lg font-semibold"
        >
            Payer {amount.toLocaleString()} FCFA
        </button>
    )
}
