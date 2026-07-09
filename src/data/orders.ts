export interface Order {
  id: string
  user_id: string
  items: Array<{ product_id: string; quantity: number; price: number }>
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  created_at?: string
  updated_at?: string
}
