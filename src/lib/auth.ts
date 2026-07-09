import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, requireSupabase } from './supabase'

export async function signUp(email: string, password: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  return await requireSupabase().auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured')
  return await requireSupabase().auth.signInWithPassword({ email, password })
}

export async function signOut() {
  if (!isSupabaseConfigured) return
  return await requireSupabase().auth.signOut()
}

export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null
  const { data } = await requireSupabase().auth.getUser()
  return data.user ?? null
}

export function onAuthStateChange(cb: (event: string, session: any) => void) {
  if (!isSupabaseConfigured) return () => {}
  const { data } = requireSupabase().auth.onAuthStateChange((event, session) => {
    cb(event, session)
  })
  return () => data.subscription.unsubscribe()
}
