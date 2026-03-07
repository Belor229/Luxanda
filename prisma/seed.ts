import { PrismaClient, Role, ProductStatus, VendorStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding demo data...')

  // 1. Create Categories
  const categories = [
    { name: 'Électronique', description: 'Smartphones, ordinateurs et gadgets' },
    { name: 'Mode', description: 'Vêtements, chaussures et accessoires' },
    { name: 'Maison', description: 'Meubles, décoration et électroménager' },
    { name: 'Beauté', description: 'Cosmétiques et soins personnels' },
  ]

  const createdCategories = []
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    createdCategories.push(created)
  }

  // 2. Create a Demo Vendor
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@luxanda.demo' },
    update: {},
    create: {
      email: 'vendor@luxanda.demo',
      password: 'password123', // In real app, this should be hashed
      role: Role.VENDOR,
      profile: {
        create: {
          firstName: 'Jean',
          lastName: 'Vendeur',
          phone: '+229 00 00 00 01',
        }
      }
    }
  })

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'Luxanda Tech',
      description: 'Votre boutique de confiance pour l\'électronique au Bénin.',
      status: VendorStatus.APPROVED,
    }
  })

  // 3. Create active subscription for vendor
  await prisma.subscription.create({
    data: {
      userId: vendorUser.id,
      plan: SubscriptionPlan.PRO,
      amount: 15000,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  })

  // 4. Create 12 Realistic Products
  const products = [
    {
      name: 'iPhone 15 Pro Max',
      description: 'Le dernier cri d\'Apple avec un appareil photo révolutionnaire.',
      price: 950000,
      quantity: 5,
      categoryId: createdCategories[0].id,
      images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'MacBook Air M2',
      description: 'Ultra fin, ultra puissant pour tous vos travaux créatifs.',
      price: 850000,
      quantity: 3,
      categoryId: createdCategories[0].id,
      images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Montre de Luxe Classique',
      description: 'L\'élégance à votre poignet pour toutes les occasions.',
      price: 125000,
      quantity: 10,
      categoryId: createdCategories[1].id,
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Sac à main Cuir Véritable',
      description: 'La mode africaine rencontre le luxe international.',
      price: 45000,
      quantity: 15,
      categoryId: createdCategories[1].id,
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Canapé Design Scandinave',
      description: 'Confort et style pour votre salon.',
      price: 350000,
      quantity: 2,
      categoryId: createdCategories[2].id,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Machine à café Espresso',
      description: 'Commencez vos journées avec un café de qualité professionnelle.',
      price: 75000,
      quantity: 8,
      categoryId: createdCategories[2].id,
      images: ['https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Parfums Signature Homme',
      description: 'Une fragrance boisée qui dure toute la journée.',
      price: 55000,
      quantity: 20,
      categoryId: createdCategories[3].id,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Kit de Soins Bio',
      description: 'Prenez soin de votre peau avec des ingrédients naturels.',
      price: 25000,
      quantity: 30,
      categoryId: createdCategories[3].id,
      images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'L\'IA au service de votre productivité mobile.',
      price: 850000,
      quantity: 4,
      categoryId: createdCategories[0].id,
      images: ['https://images.unsplash.com/photo-1707246544154-15f532b2e84f?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Sneakers Limited Edition',
      description: 'Confort et style urbain pour les passionnés.',
      price: 65000,
      quantity: 12,
      categoryId: createdCategories[1].id,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Lampe de Chevet Connectée',
      description: 'Contrôlez l\'ambiance de votre chambre depuis votre smartphone.',
      price: 35000,
      quantity: 15,
      categoryId: createdCategories[2].id,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed657f992a?q=80&w=1000&auto=format&fit=crop'],
    },
    {
      name: 'Sérum Éclat Vitamine C',
      description: 'Illuminez votre teint avec notre sérum best-seller.',
      price: 15000,
      quantity: 40,
      categoryId: createdCategories[3].id,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop'],
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        vendorId: vendor.id,
        status: ProductStatus.ACTIVE,
        featured: Math.random() > 0.5,
      }
    })
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
