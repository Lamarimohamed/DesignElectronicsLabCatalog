import type { Category } from '../data/categories'
import { isSupabaseConfigured, requireSupabase } from './supabase'

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await requireSupabase().from('categories').select('*').order('name')
  if (error) throw error
  return data as Category[]
}

export async function upsertCategory(cat: Category) {
  if (!isSupabaseConfigured) return cat
  const { data, error } = await requireSupabase().from('categories').upsert(cat, { onConflict: 'id' }).select().single()
  if (error) throw error
  return data as Category
}
