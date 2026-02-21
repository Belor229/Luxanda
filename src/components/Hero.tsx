'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Truck, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden pb-12 sm:pb-0">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-72 h-72 bg-primary-orange/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="container-custom section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
                <span className="text-primary-orange">Luxanda</span>
                <br />
                <span className="text-gray-800">Le marché qui inspire confiance</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed font-medium max-w-lg">
                La plateforme n°1 qui connecte vendeurs et acheteurs en toute sécurité.
                Qualité certifiée, livraison en cours de lancement.
              </p>

            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn btn-primary text-base sm:text-lg px-8 py-4 group shadow-xl shadow-primary-orange/20 transform hover:-translate-y-1 transition-all">
                Explorer le catalogue
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register" className="btn btn-outline text-base sm:text-lg px-8 py-4 border-2 hover:bg-gray-50 transition-all font-black">
                Devenir Vendeur
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
              {[
                { icon: Shield, label: 'Sécurisé', sub: 'Paiements VIP', color: 'green' },
                { icon: Truck, label: 'Livraison', sub: 'En cours', color: 'blue' },
                { icon: Star, label: 'Qualité', sub: 'Vérifiée', color: 'orange' },
                { icon: Award, label: 'Garantie', sub: 'Achat serein', color: 'purple' }

              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex flex-col space-y-2"
                >
                  <div className={`p-2 bg-${item.color}-50 w-fit rounded-xl`}>
                    <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm italic">{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: 'spring' }}
            className="relative"
          >
            <div className="relative z-10 p-12 bg-white/40 backdrop-blur-xl rounded-[60px] border border-white/50 shadow-2xl overflow-hidden group">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
              >

                <Image
                  src="/images/logoluxanda.png"
                  alt="Luxanda - Branding"
                  width={500}
                  height={250}
                  className="w-full h-auto drop-shadow-2xl translate-y-2 group-hover:scale-110 transition-transform duration-700"
                  priority
                />
              </motion.div>

              <div className="mt-12 text-center">
                <p className="text-sm font-black text-primary-blue uppercase tracking-[0.3em] mb-2 opacity-60">Depuis 2026</p>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Élégance & Fiabilité</h2>
              </div>
            </div>

            {/* Decorative Orbs */}
            <motion.div
              animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"
            ></motion.div>
            <motion.div
              animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0 }}
              className="absolute -bottom-12 -left-12 w-40 h-40 bg-primary-blue/20 rounded-full blur-2xl"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

