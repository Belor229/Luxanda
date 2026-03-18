import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Données de démonstration pour 12 produits réalistes
const DEMO_PRODUCTS = [
  {
    title: "iPhone 15 Pro Max - 256GB",
    description: "Dernier modèle iPhone avec écran Super Retina XDR de 6,7 pouces, chip A17 Pro, système de caméras avancé et titanium de qualité aerospace. Parfait pour les professionnels et créatifs.",
    price: 1350000,
    category: "smartphones",
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1592286115803-a1c3b552ee43?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "TechStore Pro",
      business_city: "Cotonou",
      rating: 4.8
    }
  },
  {
    title: "MacBook Air M2 - 13 pouces",
    description: "Ultra-léger et puissant avec chip M2 d'Apple, 8GB RAM, 256GB SSD, écran Liquid Retina de 13,6 pouces. Idéal pour le travail et les études.",
    price: 750000,
    category: "informatique",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1517336712831-c881e849c2c2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "MacShop Bénin",
      business_city: "Porto-Novo",
      rating: 4.9
    }
  },
  {
    title: "Samsung Galaxy Watch 6",
    description: "Montre connectée avec écran Super AMOLED, suivi fitness avancé, GPS intégré, résistance à l'eau 5ATM. Compatible iOS et Android.",
    price: 125000,
    category: "accessoires",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "Connect Plus",
      business_city: "Abomey-Calavi",
      rating: 4.6
    }
  },
  {
    title: "Sony WH-1000XM5 - Casque Bluetooth",
    description: "Casque sans fil avec réduction de bruit leader du marché, 30 heures d'autonomie, son haute résolution, multipoint Bluetooth.",
    price: 95000,
    category: "accessoires",
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484704849701-fc2e7552f5cc?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "AudioTech",
      business_city: "Cotonou",
      rating: 4.7
    }
  },
  {
    title: "iPad Air 5 - WiFi 64GB",
    description: "Tablette avec écran Liquid Retina de 10,9 pouces, chip M1, support Apple Pencil et Magic Keyboard. Parfait pour la créativité.",
    price: 450000,
    category: "tablettes",
    stock: 7,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1598928424274-9daa885b7c7b?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "Tablette Store",
      business_city: "Parakou",
      rating: 4.5
    }
  },
  {
    title: "Canon EOS R50 - Appareil Photo",
    description: "Appareil photo hybride 24MP, autofocus avancé, vidéo 4K, écran orientable. Idéal pour les photographes débutants et experts.",
    price: 320000,
    category: "photo",
    stock: 4,
    images: [
      "https://images.unsplash.com/photo-1516035065379-a4d1c859d25b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516026672399-e8781b1b3d92?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "Photo Pro",
      business_city: "Cotonou",
      rating: 4.9
    }
  },
  {
    title: "JBL Flip 6 - Enceinte Portable",
    description: "Enceinte Bluetooth étanche IP67, 12 heures d'autonomie, son puissant, design compact. Parfaite pour les fêtes et voyages.",
    price: 35000,
    category: "accessoires",
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1588023268485-a00c798747e1?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "SoundBox",
      business_city: "Ouidah",
      rating: 4.4
    }
  },
  {
    title: "PlayStation 5 - Console",
    description: "Console de jeu nouvelle génération avec SSD ultra-rapide, ray tracing, 4K 120fps, DualSense. La meilleure expérience gaming.",
    price: 550000,
    category: "gaming",
    stock: 3,
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "GameZone",
      business_city: "Cotonou",
      rating: 4.8
    }
  },
  {
    title: "Dell XPS 13 - Laptop",
    description: "Ultraportable avec écran InfinityEdge 13,4 pouces FHD+, Intel Core i7 12ème génération, 16GB RAM, 512GB SSD.",
    price: 680000,
    category: "informatique",
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517336712831-c881e849c2c2?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "Laptop Pro",
      business_city: "Abomey-Calavi",
      rating: 4.6
    }
  },
  {
    title: "AirPods Pro 2 - Earbuds",
    description: "Écouteurs sans fil avec réduction de bruit active 2x plus puissante, audio spatial, 6 heures d'autonomie, étui MagSafe.",
    price: 85000,
    category: "accessoires",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "Apple Store Bénin",
      business_city: "Cotonou",
      rating: 4.9
    }
  },
  {
    title: "Nintendo Switch - Console Hybride",
    description: "Console de jeu hybride, écran tactile 6,2 pouces, 32GB stockage, Joy-Con détachables. Jouez partout, à tout moment.",
    price: 220000,
    category: "gaming",
    stock: 9,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "GameZone",
      business_city: "Porto-Novo",
      rating: 4.7
    }
  },
  {
    title: "Logitech MX Master 3S - Souris",
    description: "Souris sans fil ultra-précise, capteur 8000 DPI, 70 jours d'autonomie, boutons personnalisables, ergonomie avancée.",
    price: 45000,
    category: "accessoires",
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1615676722348-1d5e004f6c88?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd9fc2447d0?w=400&h=300&fit=crop"
    ],
    vendor: {
      business_name: "Office Tech",
      business_city: "Cotonou",
      rating: 4.5
    }
  }
]

export async function seedDemoProducts() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Créer des vendeurs fictifs si nécessaire
    const vendors = [
      { business_name: "TechStore Pro", business_city: "Cotonou", email: "techstore@demo.com" },
      { business_name: "MacShop Bénin", business_city: "Porto-Novo", email: "macshop@demo.com" },
      { business_name: "Connect Plus", business_city: "Abomey-Calavi", email: "connect@demo.com" },
      { business_name: "AudioTech", business_city: "Cotonou", email: "audiotech@demo.com" },
      { business_name: "Tablette Store", business_city: "Parakou", email: "tablette@demo.com" },
      { business_name: "Photo Pro", business_city: "Cotonou", email: "photo@demo.com" },
      { business_name: "SoundBox", business_city: "Ouidah", email: "soundbox@demo.com" },
      { business_name: "GameZone", business_city: "Cotonou", email: "gamezone@demo.com" },
      { business_name: "Laptop Pro", business_city: "Abomey-Calavi", email: "laptop@demo.com" },
      { business_name: "Apple Store Bénin", business_city: "Cotonou", email: "apple@demo.com" },
      { business_name: "Office Tech", business_city: "Cotonou", email: "office@demo.com" }
    ]

    // Insérer les produits
    for (const productData of DEMO_PRODUCTS) {
      // Trouver ou créer le vendeur
      let vendor = await supabase
        .from('vendors')
        .select('id')
        .eq('business_name', productData.vendor.business_name)
        .single()

      if (!vendor.data) {
        // Créer un utilisateur fictif d'abord
        const { data: authUser } = await supabase.auth.admin.createUser({
          email: `${productData.vendor.business_name.toLowerCase().replace(/\s+/g, '')}@demo.com`,
          password: 'demo123456',
          email_confirm: true
        })

        if (authUser.user) {
          // Créer le profil
          await supabase
            .from('profiles')
            .insert({
              user_id: authUser.user.id,
              full_name: productData.vendor.business_name,
              phone: '+22900000000'
            })

          // Créer le vendeur
          const { data: newVendor } = await supabase
            .from('vendors')
            .insert({
              user_id: authUser.user.id,
              business_name: productData.vendor.business_name,
              business_city: productData.vendor.business_city,
              status: 'APPROVED',
              trial_start_date: new Date().toISOString(),
              trial_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single()

          vendor = { data: newVendor }
        }
      }

      if (vendor.data) {
        // Insérer le produit
        await supabase
          .from('products')
          .insert({
            vendor_id: vendor.data.id,
            title: productData.title,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            stock: productData.stock,
            image_urls: productData.images,
            status: 'ACTIVE'
          })
      }
    }

    return { success: true, message: 'Produits de démonstration créés avec succès' }
  } catch (error) {
    console.error('Erreur lors de la création des produits de démonstration:', error)
    return { success: false, error: String(error) }
  }
}

// Export pour utilisation dans un API route
export { DEMO_PRODUCTS }
