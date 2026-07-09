import { useState, useEffect, useCallback } from 'react'
import { type Product } from './data/products'
import Header from './components/Header'
import CatalogGrid from './components/CatalogGrid'
import ProductDetail from './components/ProductDetail'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'
import { fetchProducts, upsertProduct } from './lib/productsApi'
import { isSupabaseConfigured } from './lib/supabase'

export type View = 'catalog' | 'product' | 'admin'

export default function App() {
  const [view, setView] = useState<View>('catalog')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const { PRODUCTS } = await import('./data/products')
      setProducts(PRODUCTS)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le catalogue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setView('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setView('catalog')
    setSelectedProduct(null)
  }

  const handleAdminSave = async (product: Product) => {
    const saved = await upsertProduct(product)
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
  }

  if (view === 'admin') {
    return (
      <AdminPanel
        products={products}
        onSave={handleAdminSave}
        onExit={() => setView('catalog')}
        onProductsChange={setProducts}
        onReload={loadProducts}
      />
    )
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)', fontFamily: 'var(--font-sans)' }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#666' }}>
          Chargement du catalogue…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6"
        style={{ backgroundColor: 'var(--color-background)', fontFamily: 'var(--font-sans)' }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-accent)' }}>
          {error}
        </p>
        <button
          onClick={loadProducts}
          style={{
            background: '#111',
            color: '#FFF',
            border: 'none',
            padding: '8px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)', fontFamily: 'var(--font-sans)' }}>
      <Header
        view={view}
        onNavigate={(v) => {
          setView(v)
          if (v === 'catalog') setSelectedProduct(null)
        }}
      />
      <main className="flex-grow">
        {view === 'catalog' && (
          <CatalogGrid products={products} onSelect={handleSelectProduct} />
        )}
        {view === 'product' && selectedProduct && (
          <ProductDetail product={selectedProduct} onBack={handleBack} onSelect={handleSelectProduct} products={products} />
        )}
      </main>
      <Footer
        onNavigate={(v) => {
          setView(v)
          if (v === 'catalog') setSelectedProduct(null)
        }}
      />
    </div>
  )
}
