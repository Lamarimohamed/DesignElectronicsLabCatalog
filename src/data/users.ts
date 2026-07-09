export interface Profile {
  id: string
  display_name?: string
  avatar_url?: string
  is_admin: boolean
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}
