import { isSupabaseConfigured, requireSupabase } from './supabase'
import type { Order } from '../data/orders'

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await requireSupabase().from('orders').insert(order).select().single()
  if (error) throw error
  return data as Order
}

export async function fetchOrdersForUser(userId: string) {
  if (!isSupabaseConfigured) return []
  const { data, error } = await requireSupabase().from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await requireSupabase().from('orders').update({ status }).eq('id', orderId).select().single()
  if (error) throw error
  return data as Order
}
