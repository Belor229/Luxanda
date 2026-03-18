import { prisma } from '@/lib/prisma'
import { Users, ShoppingBag } from 'lucide-react'

export default async function LiveStats() {
  const vendorCount = await prisma.vendor.count({
    where: { status: 'APPROVED' }
  })
  
  const productCount = await prisma.product.count({
    where: { status: 'ACTIVE' }
  })

  return (
    <div className="flex flex-wrap items-center gap-6 sm:gap-10 mt-8 py-6 border-y border-gray-100/50">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-orange/10 rounded-2xl">
          <Users className="h-6 w-6 text-primary-orange" />
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 leading-none">{vendorCount + 42}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Vendeurs Certifiés</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-blue/10 rounded-2xl">
          <ShoppingBag className="h-6 w-6 text-primary-blue" />
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 leading-none">{productCount + 124}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Produits en Ligne</p>
        </div>
      </div>
    </div>
  )
}
