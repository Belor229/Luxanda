import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const reportSchema = z.object({
    report_type: z.enum(['PRODUCT', 'VENDOR', 'FRAUD', 'INAPPROPRIATE']),
    reason: z.string().min(1, 'La raison est requise'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
    product_id: z.string().uuid().optional(),
    vendor_id: z.string().uuid().optional()
}).refine(data => data.product_id || data.vendor_id, {
    message: "Vous devez spécifier au moins un produit ou un vendeur"
})

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = reportSchema.parse(body)

        // Vérifier si l'utilisateur peut signaler (doit être connecté)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
        }

        // Insérer le signalement
        const { data: report, error } = await supabase
            .from('reports')
            .insert({
                reporter_id: user.id,
                product_id: validatedData.product_id || null,
                vendor_id: validatedData.vendor_id || null,
                report_type: validatedData.report_type,
                reason: validatedData.reason,
                description: validatedData.description,
                status: 'PENDING'
            })
            .select()
            .single()

        if (error) throw error

        // Vérifier si le seuil de signalements est atteint pour suspension automatique
        if (validatedData.vendor_id) {
            const { data: reportCount } = await supabase
                .from('reports')
                .select('id', { count: 'exact' })
                .eq('vendor_id', validatedData.vendor_id)
                .eq('status', 'PENDING')

            const threshold = 5 // Seuil configurable
            if (reportCount && reportCount.length >= threshold) {
                // Suspendre automatiquement le vendeur
                await supabase
                    .from('vendors')
                    .update({ 
                        status: 'SUSPENDED_AUTO',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', validatedData.vendor_id)

                // Notifier l'admin (implémenter notification)
                console.log(`Vendeur ${validatedData.vendor_id} suspendu automatiquement - ${reportCount.length} signalements`)
            }
        }

        return NextResponse.json({ 
            success: true, 
            report,
            message: 'Signalement enregistré avec succès'
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Données invalides', 
                details: error.errors 
            }, { status: 400 })
        }

        console.error('Report creation error:', error)
        return NextResponse.json({ 
            error: 'Erreur interne du serveur' 
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // Vérifier si l'utilisateur est admin
        const { data: vendor } = await supabase
            .from('vendors')
            .select('status')
            .eq('user_id', user.id)
            .single()

        const isAdmin = vendor && vendor.status === 'APPROVED'

        if (!isAdmin) {
            return NextResponse.json({ error: 'Accès restreint' }, { status: 403 })
        }

        // Récupérer tous les signalements pour l'admin
        const { data: reports, error } = await supabase
            .from('reports')
            .select(`
                *,
                reporter:profiles!reporter_id(full_name, email),
                product:products(id, name),
                vendor:vendors(id, business_name)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ reports })

    } catch (error) {
        console.error('Reports fetch error:', error)
        return NextResponse.json({ 
            error: 'Erreur interne du serveur' 
        }, { status: 500 })
    }
}
