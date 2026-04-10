import { prisma } from '@/lib/prisma'

// Données de démonstration pour 12 produits réalistes
const DEMO_PRODUCTS = [
  {
    title: "iPhone 15 Pro Max - 256GB",
    description: "Dernier modèle iPhone avec écran Super Retina XDR de 6,7 pouces, chip A17 Pro, système de caméras avancé et titanium de qualité aerospace. Parfait pour les professionnels et créatifs.",
    price: 1350000,
    category: "Électronique & Téléphones",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "TechStore Pro",
      city: "Cotonou",
      rating: 4.8
    }
  },
  {
    title: "MacBook Air M2 - 13 pouces",
    description: "Ultra-léger et puissant avec chip M2 d'Apple, 8GB RAM, 256GB SSD, écran Liquid Retina de 13,6 pouces. Idéal pour le travail et les études.",
    price: 750000,
    category: "Électronique & Téléphones",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1517336712831-c881e849c2c2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "MacShop Bénin",
      city: "Porto-Novo",
      rating: 4.9
    }
  },
  {
    title: "Samsung Galaxy Watch 6",
    description: "Montre connectée avec écran Super AMOLED, suivi fitness avancé, GPS intégré, résistance à l'eau 5ATM. Compatible iOS et Android.",
    price: 125000,
    category: "Électronique & Téléphones",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "Connect Plus",
      city: "Abomey-Calavi",
      rating: 4.6
    }
  },
  {
    title: "Sony WH-1000XM5 - Casque Bluetooth",
    description: "Casque sans fil avec réduction de bruit leader du marché, 30 heures d'autonomie, son haute résolution, multipoint Bluetooth.",
    price: 95000,
    category: "Électronique & Téléphones",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484704849701-fc2e7552f5cc?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "AudioTech",
      city: "Cotonou",
      rating: 4.7
    }
  },
  {
    title: "iPad Air 5 - WiFi 64GB",
    description: "Tablette avec écran Liquid Retina de 10,9 pouces, chip M1, support Apple Pencil et Magic Keyboard. Parfait pour la créativité.",
    price: 450000,
    category: "Électronique & Téléphones",
    stock: 7,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1598928424274-9daa885b7c7b?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "Tablette Store",
      city: "Parakou",
      rating: 4.5
    }
  },
  {
    title: "Canon EOS R50 - Appareil Photo",
    description: "Appareil photo hybride 24MP, autofocus avancé, vidéo 4K, écran orientable. Idéal pour les photographes débutants et experts.",
    price: 320000,
    category: "Électronique & Téléphones",
    stock: 4,
    images: [
      "https://images.unsplash.com/photo-1516035065379-a4d1c859d25b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516026672399-e8781b1b3d92?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "Photo Pro",
      city: "Cotonou",
      rating: 4.9
    }
  },
  {
    title: "JBL Flip 6 - Enceinte Portable",
    description: "Enceinte Bluetooth étanche IP67, 12 heures d'autonomie, son puissant, design compact. Parfaite pour les fêtes et voyages.",
    price: 35000,
    category: "Électronique & Téléphones",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1588023268485-a00c798747e1?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "SoundBox",
      city: "Ouidah",
      rating: 4.4
    }
  },
  {
    title: "PlayStation 5 - Console",
    description: "Console de jeu nouvelle génération avec SSD ultra-rapide, ray tracing, 4K 120fps, DualSense. La meilleure expérience gaming.",
    price: 550000,
    category: "Électronique & Téléphones",
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "GameZone",
      city: "Cotonou",
      rating: 4.8
    }
  },
  {
    title: "Dell XPS 13 - Laptop",
    description: "Ultraportable avec écran InfinityEdge 13,4 pouces FHD+, Intel Core i7 12ème génération, 16GB RAM, 512GB SSD.",
    price: 680000,
    category: "Électronique & Téléphones",
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517336712831-c881e849c2c2?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "Laptop Pro",
      city: "Abomey-Calavi",
      rating: 4.6
    }
  },
  {
    title: "AirPods Pro 2 - Earbuds",
    description: "Écouteurs sans fil avec réduction de bruit active 2x plus puissante, audio spatial, 6 heures d'autonomie, étui MagSafe.",
    price: 85000,
    category: "Électronique & Téléphones",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "Apple Store Bénin",
      city: "Cotonou",
      rating: 4.9
    }
  },
  {
    title: "Nintendo Switch - Console Hybride",
    description: "Console de jeu hybride, écran tactile 6,2 pouces, 32GB stockage, Joy-Con détachables. Jouez partout, à tout moment.",
    price: 220000,
    category: "Électronique & Téléphones",
    stock: 9,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "GameZone",
      city: "Porto-Novo",
      rating: 4.7
    }
  },
  {
    title: "Logitech MX Master 3S - Souris",
    description: "Souris sans fil ultra-précise, capteur 8000 DPI, 70 jours d'autonomie, boutons personnalisables, ergonomie avancée.",
    price: 45000,
    category: "Électronique & Téléphones",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1615676722348-1d5e004f6c88?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd9fc2447d0?w=400&h=300&fit=crop"
    ],
    vendor: {
      store_name: "Office Tech",
      city: "Cotonou",
      rating: 4.5
    }
  }
]

export async function seedDemoProducts(adminUserId: string) {
  try {
    // 1. Assurer la présence des catégories
    const categoriesNames = [...new Set(DEMO_PRODUCTS.map(p => p.category))]
    const categoriesMap: Record<string, string> = {}

    for (const name of categoriesNames) {
      const cat = await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, description: `Catégorie ${name}` }
      })
      categoriesMap[name] = cat.id
    }

    // 2. Créer un vendeur par défaut (on utilise l'admin comme propriétaire pour le démo)
    const vendor = await prisma.vendor.upsert({
      where: { userId: adminUserId },
      update: { status: 'APPROVED' },
      create: {
        userId: adminUserId,
        storeName: "Luxanda Official",
        city: "Cotonou",
        status: 'APPROVED',
        trial_start_date: new Date(),
        trial_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    })

    // 3. Insérer les produits
    let count = 0
    for (const p of DEMO_PRODUCTS) {
      await prisma.product.create({
        data: {
          name: p.title,
          description: p.description,
          price: p.price,
          quantity: p.stock,
          images: p.images,
          status: 'ACTIVE',
          categoryId: categoriesMap[p.category],
          vendorId: vendor.id,
          featured: true
        }
      })
      count++
    }

    return { success: true, message: `${count} produits créés.` }
  } catch (error) {
    console.error('Seed error:', error)
    return { success: false, error: String(error) }
  }
}

export { DEMO_PRODUCTS }
