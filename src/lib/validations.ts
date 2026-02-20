import { z } from 'zod'

export const productSchema = z.object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(100),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères').optional().nullable(),
    price: z.number().positive('Le prix doit être positif'),
    category_id: z.string().uuid('ID de catégorie invalide').optional().nullable(),
    image_urls: z.array(z.string().url('URL d\'image invalide')).default([]),
    stock: z.number().int().min(0, 'Le stock ne peut pas être négatif').default(0),
    status: z.enum(['active', 'draft', 'archived']).default('draft'),
    featured: z.boolean().default(false)
})

export const vendorStatusSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING'])
})

export const orderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
})

export const orderCreateSchema = z.object({
    shipping_address: z.string().min(5, 'L\'adresse est requise'),
    phone_contact: z.string().min(8, 'Numéro de téléphone invalide'),
    total_amount: z.number().positive(),
    seller_id: z.string().uuid(),
    items: z.array(z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive()
    })).min(1, 'Le panier ne peut pas être vide')
})

export const cartItemSchema = z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive().default(1)
})
