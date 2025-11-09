'use client'

import { useEffect, useRef } from 'react'

interface KkiapayWidgetProps {
  amount: number
  key: string
  callback: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
}

declare global {
  interface Window {
    kkiapay: {
      init: (config: any) => void
      open: () => void
      close: () => void
    }
  }
}

export default function KkiapayWidget({ 
  amount, 
  key, 
  callback, 
  onSuccess, 
  onError, 
  onClose 
}: KkiapayWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Charger le script Kkiapay
    const script = document.createElement('script')
    script.src = 'https://cdn.kkiapay.me/k.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.kkiapay) {
        // Configuration du widget
        window.kkiapay.init({
          amount: amount,
          key: key,
          callback: callback,
          onSuccess: onSuccess,
          onError: onError,
          onClose: onClose
        })
      }
    }

    return () => {
      // Nettoyer le script
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [amount, key, callback, onSuccess, onError, onClose])

  const handlePayment = () => {
    if (window.kkiapay) {
      window.kkiapay.open()
    }
  }

  return (
    <div ref={widgetRef}>
      <button
        onClick={handlePayment}
        className="w-full btn btn-primary flex items-center justify-center space-x-2"
      >
        <span>Payer avec Kkiapay</span>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>
    </div>
  )
}

