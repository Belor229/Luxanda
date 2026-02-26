import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const vendorValidationSchema = z.object({
    business_name: z.string().min(2, 'Le nom de l\'entreprise est requis'),
    business_description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    business_email: z.string().email('Email invalide'),
    business_phone: z.string().min(8, 'Le téléphone doit contenir au moins 8 caractères'),
    business_address: z.string().min(5, 'L\'adresse est requise'),
    business_city: z.string().min(2, 'La ville est requise'),
    category: z.string().min(2, 'La catégorie est requise'),
    identity_document_url: z.string().url('URL du document d\'identité invalide').optional(),
    selfie_document_url: z.string().url('URL du selfie invalide').optional()
})

export async function POST(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = vendorValidationSchema.parse(body)

        // Vérifier si l'utilisateur a déjà un compte vendeur
        const { data: existingVendor } = await supabase
            .from('vendors')
            .select('id, status')
            .eq('user_id', user.id)
            .single()

        if (existingVendor) {
            return NextResponse.json({ 
                error: 'Vous avez déjà une demande de vendeur en cours',
                status: existingVendor.status 
            }, { status: 400 })
        }

        // Créer le vendeur avec statut PENDING_VALIDATION
        const { data: vendor, error } = await supabase
            .from('vendors')
            .insert({
                user_id: user.id,
                business_name: validatedData.business_name,
                business_description: validatedData.business_description,
                business_email: validatedData.business_email,
                business_phone: validatedData.business_phone,
                business_address: validatedData.business_address,
                business_city: validatedData.business_city,
                category: validatedData.category,
                status: 'PENDING_VALIDATION',
                verification_documents: {
                    identity_document_url: validatedData.identity_document_url,
                    selfie_document_url: validatedData.selfie_document_url
                },
                identity_document_url: validatedData.identity_document_url,
                selfie_document_url: validatedData.selfie_document_url,
                phone_verified: false,
                email_verified: user.email_confirmed_at ? true : false
            })
            .select()
            .single()

        if (error) throw error

        // Créer l'abonnement (sans trial pour l'instant)
        const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
                vendor_id: vendor.id,
                plan: 'PREMIUM',
                status: 'PENDING' // En attente de validation admin
            })

        if (subscriptionError) throw subscriptionError

        return NextResponse.json({ 
            success: true, 
            vendor,
            message: 'Demande de vendeur soumise avec succès. En attente de validation admin.'
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Données invalides', 
                details: error.errors 
            }, { status: 400 })
        }

        console.error('Vendor validation error:', error)
        return NextResponse.json({ 
            error: 'Erreur interne du serveur' 
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Récupérer le statut du vendeur
        const { data: vendor, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error
        }

        if (!vendor) {
            return NextResponse.json({ 
                vendor: null, 
                message: 'Aucune demande de vendeur trouvée' 
            })
        }

        return NextResponse.json({ vendor })

    } catch (error) {
        console.error('Vendor status fetch error:', error)
        return NextResponse.json({ 
            error: 'Erreur interne du serveur' 
        }, { status: 500 })
    }
}
