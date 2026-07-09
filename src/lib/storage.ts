import { isSupabaseConfigured, requireSupabase } from './supabase'

const BUCKET = 'product-images'

export async function uploadProductImage(path: string, file: File) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { data, error } = await requireSupabase().storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return data
}

export function getPublicUrl(path: string) {
  if (!isSupabaseConfigured) return null
  return requireSupabase().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deleteFile(path: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  const { error } = await requireSupabase().storage.from(BUCKET).remove([path])
  if (error) throw error
  return true
}
