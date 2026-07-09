import type { Product, ProductSpec } from '../data/products'
import { PRODUCTS } from '../data/products'
import { isSupabaseConfigured, requireSupabase } from './supabase'

type ProductRow = {
  id: string
  ref: string
  name: string
  category: string
  subcategory: string
  description: string
  short_desc: string
  image: string
  pdf_url: string
  availability: Product['availability']
  specs: ProductSpec[]
  tags: string[]
  norm: string | null
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    ref: row.ref,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    shortDesc: row.short_desc,
    image: row.image,
    pdfUrl: row.pdf_url ?? undefined,
    availability: row.availability,
    specs: row.specs ?? [],
    tags: row.tags ?? [],
    norm: row.norm ?? undefined,
  }
}

function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    ref: product.ref,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    description: product.description,
    short_desc: product.shortDesc,
    image: product.image,
    pdf_url: product.pdfUrl ?? '',
    availability: product.availability,
    specs: product.specs,
    tags: product.tags,
    norm: product.norm ?? null,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return PRODUCTS
  }

  const { data, error } = await requireSupabase()
    .from('products')
    .select('*')
    .order('name')

  if (error) throw error
  return (data as ProductRow[]).map(rowToProduct)
}

export async function upsertProduct(product: Product): Promise<Product> {
  if (!isSupabaseConfigured) {
    return product
  }

  const row = productToRow(product)
  const { data, error } = await requireSupabase()
    .from('products')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return rowToProduct(data as ProductRow)
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) return

  const { error } = await requireSupabase().from('products').delete().eq('id', id)
  if (error) throw error
}

export async function seedDemoProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return PRODUCTS
  }

  const rows = PRODUCTS.map(productToRow)
  const { data, error } = await requireSupabase()
    .from('products')
    .upsert(rows, { onConflict: 'id' })
    .select()

  if (error) throw error
  return (data as ProductRow[]).map(rowToProduct)
}
