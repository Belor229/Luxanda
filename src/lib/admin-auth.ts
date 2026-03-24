import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

/**
 * Vérifie que l'utilisateur est admin.
 * Priorité : table Supabase `public.users` (auth), puis Prisma (même DB).
 */
export async function assertAdmin(
  authUser: User | null,
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; status: 401 | 403; message: string }> {
  if (!authUser?.id) {
    return { ok: false, status: 401, message: 'Non autorisé' }
  }

  const { data: sbRow, error: sbErr } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .maybeSingle()

  if (!sbErr && sbRow && String(sbRow.role).toUpperCase() === 'ADMIN') {
    return { ok: true }
  }

  const prismaUser = await prisma.user
    .findUnique({
      where: { id: authUser.id },
      select: { role: true },
    })
    .catch(() => null)

  if (prismaUser && String(prismaUser.role).toUpperCase() === 'ADMIN') {
    return { ok: true }
  }

  return { ok: false, status: 403, message: 'Accès administrateur requis' }
}
