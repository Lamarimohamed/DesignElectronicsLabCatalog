import { useState } from 'react'
import { PRODUCTS, type Product } from './data/products'
import Header from './components/Header'
import CatalogGrid from './components/CatalogGrid'
import ProductDetail from './components/ProductDetail'
import AdminPanel from './components/AdminPanel'

export type View = 'catalog' | 'product' | 'admin'

export default function App() {
  const [view, setView] = useState<View>('catalog')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>(PRODUCTS)

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setView('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setView('catalog')
    setSelectedProduct(null)
  }

  const handleAdminSave = (product: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = product
        return next
      }
      return [...prev, product]
    })
  }

  if (view === 'admin') {
    return (
      <AdminPanel
        products={products}
        onSave={handleAdminSave}
        onExit={() => setView('catalog')}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)', fontFamily: 'var(--font-sans)' }}>
      <Header
        view={view}
        onNavigate={(v) => {
          setView(v)
          if (v === 'catalog') setSelectedProduct(null)
        }}
      />
      <main>
        {view === 'catalog' && (
          <CatalogGrid products={products} onSelect={handleSelectProduct} />
        )}
        {view === 'product' && selectedProduct && (
          <ProductDetail product={selectedProduct} onBack={handleBack} onSelect={handleSelectProduct} products={products} />
        )}
      </main>
    </div>
  )
}
