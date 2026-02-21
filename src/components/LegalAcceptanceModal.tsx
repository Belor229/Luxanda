'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function LegalAcceptanceModal() {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function checkAcceptance() {
            try {
                // First check if session exists
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    setLoading(false)
                    return
                }

                const res = await fetch('/api/legal/acceptance')
                if (res.status === 401) {
                    setLoading(false)
                    return
                }

                const data = await res.json()
                console.log('Legal acceptance data:', data) // Debug log
                
                if (!data.cgu_version || data.cgu_version !== '1.0') {
                    console.log('Showing legal modal - version mismatch or missing')
                    setIsOpen(true)
                } else {
                    console.log('Legal acceptance already completed')
                    setIsOpen(false)
                }
            } catch (err) {
                console.error('Failed to check legal status', err)
            } finally {
                setLoading(false)
            }
        }
        checkAcceptance()
    }, [supabase])


    const handleAccept = async () => {
        setSubmitting(true)
        try {
            const res = await fetch('/api/legal/acceptance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ version: '1.0' })
            })
            
            console.log('Acceptance response status:', res.status)
            console.log('Acceptance response ok:', res.ok)
            
            if (res.ok) {
                console.log('Setting isOpen to false')
                setIsOpen(false)
                // Force recheck after successful acceptance
                setTimeout(() => {
                    console.log('Reloading page...')
                    window.location.href = window.location.href // Force complete reload
                }, 500)
            } else {
                const errorData = await res.json().catch(() => ({}))
                console.error('Acceptance failed:', res.status, res.statusText, errorData)
                // Show error to user
                alert(`Erreur ${res.status}: ${errorData.error || 'Veuillez réessayer.'}`)
            }
        } catch (err) {
            console.error('Acceptance failed', err)
            alert('Erreur réseau. Veuillez réessayer.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRefuse = () => {
        // Rediriger vers une page externe ou fermer le site
        window.location.href = 'https://www.google.com'
    }

    if (loading || !isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    <div className="p-8 sm:p-12 text-center">
                        <div className="bg-primary-orange/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShieldCheck className="h-10 w-10 text-primary-orange" />
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                            Mise à jour de sécurité
                        </h2>

                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                            Pour continuer à utiliser Luxanda, vous devez accepter nos nouvelles <Link href="/terms" target="_blank" className="text-primary-blue underline inline-flex items-center">CGU et Politique de Confidentialité <ExternalLink className="h-3 w-3 ml-1" /></Link>.
                            Nous avons renforcé la protection de vos données et la sécurité des transactions.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={handleAccept}
                                disabled={submitting}
                                className="w-full btn btn-primary py-4 text-lg shadow-xl shadow-primary-orange/20 flex items-center justify-center group"
                            >
                                {submitting ? 'Validation...' : 'Accepter et Continuer'}
                                {!submitting && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <button
                                onClick={handleRefuse}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 text-lg font-medium rounded-full transition-colors"
                            >
                                Refuser et Quitter
                            </button>

                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest"> Version 1.0 — Février 2026 </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 border-t border-gray-100 italic text-center text-xs text-gray-400">
                        Luxanda SARL • Place de marché intermédiaire technique sécurisée.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
