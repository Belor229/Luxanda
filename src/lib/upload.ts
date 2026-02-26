import { createClient } from '@/utils/supabase/client'

/**
 * Compress an image using the browser's Canvas API.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                if (width > maxWidth) {
                    height = (maxWidth / width) * height
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob)
                        else reject(new Error('Canvas compression failed'))
                    },
                    'image/jpeg',
                    quality
                )
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}

/**
 * Upload an image to Supabase Storage with compression.
 */
export async function uploadProductImage(file: File, sellerId: string): Promise<string | null> {
    const supabase = createClient()

    try {
        // 1. Validate (Simple size/type check)
        if (!file.type.startsWith('image/')) throw new Error('Le fichier doit être une image')
        if (file.size > 5 * 1024 * 1024) throw new Error("L'image est trop lourde (max 5MB)")

        // 2. Compress
        const compressedBlob = await compressImage(file)

        // 3. Upload
        const fileName = `${sellerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
        const { data, error } = await supabase.storage
            .from('products')
            .upload(fileName, compressedBlob, {
                contentType: 'image/jpeg',
                upsert: false
            })

        if (error) throw error

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName)

        return publicUrl
    } catch (error: any) {
        console.error('Upload error:', error)
        return null
    }
}

/**
 * Upload an identity document to a private Supabase Storage bucket.
 */
export async function uploadIdentityDocument(file: File, userId: string, type: 'id_card' | 'selfie'): Promise<string | null> {
    const supabase = createClient()

    try {
        // 1. Validate
        if (!file.type.startsWith('image/')) throw new Error('Le fichier doit être une image')
        if (file.size > 10 * 1024 * 1024) throw new Error("L'image est trop lourde (max 10MB)")

        // 2. Compress (optional but good for speed)
        const compressedBlob = await compressImage(file, 1600, 0.7)

        // 3. Upload to private bucket 'identity-documents'
        const fileName = `${userId}/${type}-${Date.now()}.jpg`
        const { data, error } = await supabase.storage
            .from('identity-documents')
            .upload(fileName, compressedBlob, {
                contentType: 'image/jpeg',
                upsert: true
            })

        if (error) throw error

        // 4. Return the path (not public URL as it's a private bucket)
        return data.path
    } catch (error: any) {
        console.error('Identity upload error:', error)
        return null
    }
}
