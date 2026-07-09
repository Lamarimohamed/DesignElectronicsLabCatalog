import type { Profile } from '../data/users'
import { isSupabaseConfigured, requireSupabase } from './supabase'

export async function fetchProfile(id: string) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await requireSupabase().from('profiles').select('*').eq('id', id).single()
  if (error) throw error
  return data as Profile
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  if (!isSupabaseConfigured) return profile
  const { data, error } = await requireSupabase().from('profiles').upsert(profile).select().single()
  if (error) throw error
  return data as Profile
}

export async function listAdmins() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await requireSupabase().from('profiles').select('*').eq('is_admin', true)
  if (error) throw error
  return data
}
