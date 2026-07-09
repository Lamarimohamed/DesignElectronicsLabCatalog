import { useState, useMemo } from 'react'
import { CATEGORIES, type Product, type Availability } from '../data/products'

interface CatalogGridProps {
  products: Product[]
  onSelect: (product: Product) => void
}

const AVAILABILITY_LABELS: Record<Availability, string> = {
  stock: 'En stock',
  commande: 'Sur commande',
  discontinue: 'Discontinué',
}

const AVAILABILITY_COLORS: Record<Availability, string> = {
  stock: 'var(--color-success)',
  commande: 'var(--color-warning)',
  discontinue: 'var(--color-muted-foreground)',
}

export default function CatalogGrid({ products, onSelect }: CatalogGridProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        search.trim() === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.ref.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
      const matchesAvail = selectedAvailability === 'all' || p.availability === selectedAvailability
      return matchesSearch && matchesCategory && matchesAvail
    })
  }, [products, search, selectedCategory, selectedAvailability])

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Page heading */}
      <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-baseline gap-4 flex-wrap">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '2rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: 'var(--color-foreground)',
              lineHeight: 1,
            }}
          >
            Catalogue Produits
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
            }}
          >
            {filtered.length} / {products.length} références
          </span>
        </div>
        <p className="mt-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--color-muted-foreground)', maxWidth: 600 }}>
          Fiches techniques, spécifications et documentations pour ingénieurs et acheteurs techniques.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-[200px] flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-6 md:gap-0">
          {/* Search */}
          <div className="mb-6 sm:mb-0 md:mb-6 sm:flex-1">
            <label
              htmlFor="search"
              className="block mb-1.5"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted-foreground)' }}
            >
              Recherche
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Réf., nom, tag…"
                className="w-full border pl-8 pr-3 py-2 text-sm transition-colors"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8125rem',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
              <svg className="absolute left-2.5 top-2.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="var(--color-muted-foreground)" strokeWidth="1.5"/>
                <line x1="9" y1="9" x2="13" y2="13" stroke="var(--color-muted-foreground)" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            </div>
          </div>

          {/* Category filter */}
          <div className="mb-6 sm:mb-0 md:mb-6 sm:flex-1">
            <div
              className="mb-2 pb-1.5 border-b"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-muted-foreground)',
                borderColor: 'var(--color-border)',
              }}
            >
              Catégorie
            </div>
            <FilterOption
              label="Toutes"
              count={products.length}
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            {CATEGORIES.map(cat => (
              <FilterOption
                key={cat}
                label={cat}
                count={products.filter(p => p.category === cat).length}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>

          {/* Availability filter */}
          <div className="mb-6 sm:mb-0 md:mb-6 sm:flex-1">
            <div
              className="mb-2 pb-1.5 border-b"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-muted-foreground)',
                borderColor: 'var(--color-border)',
              }}
            >
              Disponibilité
            </div>
            <FilterOption
              label="Toutes"
              active={selectedAvailability === 'all'}
              onClick={() => setSelectedAvailability('all')}
            />
            {(['stock', 'commande', 'discontinue'] as Availability[]).map(avail => (
              <FilterOption
                key={avail}
                label={AVAILABILITY_LABELS[avail]}
                active={selectedAvailability === avail}
                onClick={() => setSelectedAvailability(avail)}
                dot={AVAILABILITY_COLORS[avail]}
              />
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              {filtered.length === 0 ? 'Aucun résultat' : `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`}
            </div>
            <div className="flex items-center gap-0 border" style={{ borderColor: 'var(--color-border)' }}>
              <LayoutButton
                active={layout === 'grid'}
                onClick={() => setLayout('grid')}
                title="Vue grille"
              >
                <GridIcon />
              </LayoutButton>
              <LayoutButton
                active={layout === 'list'}
                onClick={() => setLayout('list')}
                title="Vue liste"
              >
                <ListIcon />
              </LayoutButton>
            </div>
          </div>

          {/* Product grid / list */}
          {filtered.length === 0 ? (
            <div
              className="border py-16 text-center"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
            >
              Aucun produit ne correspond aux critères sélectionnés.
            </div>
          ) : layout === 'grid' ? (
            <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', background: 'var(--color-border)' }}>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onSelect={onSelect} />
              ))}
            </div>
          ) : (
            <div className="border" style={{ borderColor: 'var(--color-border)' }}>
              {filtered.map((product, i) => (
                <ProductRow key={product.id} product={product} onSelect={onSelect} isLast={i === filtered.length - 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterOption({
  label, count, active, onClick, dot,
}: {
  label: string; count?: number; active: boolean; onClick: () => void; dot?: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-1 px-1 text-left transition-colors"
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.8125rem',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-accent)' : 'var(--color-foreground)',
        background: 'transparent',
        borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
        paddingLeft: active ? '0.5rem' : '0.25rem',
      }}
    >
      <span className="flex items-center gap-1.5">
        {dot && (
          <span className="inline-block rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: dot }} />
        )}
        {label}
      </span>
      {count !== undefined && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted-foreground)' }}>
          {count}
        </span>
      )}
    </button>
  )
}

function LayoutButton({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center transition-colors"
      style={{
        width: 32,
        height: 32,
        background: active ? 'var(--color-foreground)' : 'transparent',
        color: active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
      }}
    >
      {children}
    </button>
  )
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="bg-card flex flex-col cursor-pointer transition-all"
      style={{
        background: 'var(--color-card)',
        outline: hovered ? '2px solid var(--color-accent)' : 'none',
        outlineOffset: -1,
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
      onKeyDown={e => e.key === 'Enter' && onSelect(product)}
      tabIndex={0}
      role="button"
      aria-label={`Voir la fiche de ${product.name}`}
    >
      {/* Accent left bar */}
      <div
        className="absolute top-0 left-0 bottom-0 transition-all"
        style={{ width: hovered ? 3 : 2, background: hovered ? 'var(--color-accent)' : 'var(--color-border)' }}
      />

      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 160, background: '#1a2230' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)', opacity: 0.85 }}
        />
        {/* Crosshair overlay on hover */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="8" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none"/>
              <line x1="20" y1="4" x2="20" y2="11" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
              <line x1="20" y1="29" x2="20" y2="36" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
              <line x1="4" y1="20" x2="11" y2="20" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
              <line x1="29" y1="20" x2="36" y2="20" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
              <circle cx="20" cy="20" r="2" fill="var(--color-accent)"/>
            </svg>
          </div>
        )}
        {/* Ref badge */}
        <div
          className="absolute bottom-0 left-0 px-2 py-1"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            background: 'rgba(15,25,35,0.85)',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.04em',
          }}
        >
          {product.ref}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 pl-5">
        {/* Category */}
        <div
          className="mb-1"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-muted-foreground)',
          }}
        >
          {product.category}
        </div>

        {/* Name */}
        <h2
          className="mb-2 leading-snug"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.9375rem',
            letterSpacing: '0.01em',
            color: 'var(--color-foreground)',
          }}
        >
          {product.name}
        </h2>

        {/* Short desc */}
        <p
          className="mb-3 flex-1"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'var(--color-muted-foreground)',
            lineHeight: 1.5,
          }}
        >
          {product.shortDesc}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {/* Availability */}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{
                width: 6,
                height: 6,
                background: AVAILABILITY_COLORS[product.availability],
                boxShadow: product.availability === 'stock' ? `0 0 4px ${AVAILABILITY_COLORS[product.availability]}` : 'none',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted-foreground)' }}>
              {AVAILABILITY_LABELS[product.availability]}
            </span>
          </div>

          {/* CTA */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: hovered ? 'var(--color-accent)' : 'var(--color-muted-foreground)',
              transition: 'color 0.15s',
            }}
          >
            Fiche →
          </span>
        </div>
      </div>
    </article>
  )
}

function ProductRow({ product, onSelect, isLast }: { product: Product; onSelect: (p: Product) => void; isLast: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-stretch cursor-pointer transition-colors"
      style={{
        background: hovered ? 'rgba(200,55,10,0.04)' : 'var(--color-card)',
        borderBottom: isLast ? 'none' : `1px solid var(--color-border)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
      onKeyDown={e => e.key === 'Enter' && onSelect(product)}
      tabIndex={0}
      role="button"
      aria-label={`Voir la fiche de ${product.name}`}
    >
      {/* Accent bar */}
      <div style={{ width: 3, background: hovered ? 'var(--color-accent)' : 'transparent', flexShrink: 0, transition: 'background 0.15s' }} />

      {/* Thumbnail */}
      <div className="flex-shrink-0" style={{ width: 80, height: 64, background: '#1a2230', overflow: 'hidden' }}>
        <img src={product.image} alt="" className="w-full h-full object-cover" style={{ opacity: 0.85 }} />
      </div>

      {/* Info */}
      <div className="flex flex-col sm:flex-row sm:items-center flex-1 px-4 py-3 gap-2 sm:gap-4 min-w-0">
        <div className="flex-shrink-0 w-full sm:w-[120px]">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 500 }}>{product.ref}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{product.subcategory}</div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis' }} className="whitespace-normal sm:whitespace-nowrap">{product.name}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--color-muted-foreground)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }} className="whitespace-normal sm:whitespace-nowrap">{product.shortDesc}</div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: AVAILABILITY_COLORS[product.availability] }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-muted-foreground)' }}>{AVAILABILITY_LABELS[product.availability]}</span>
        </div>

        <div className="hidden sm:block" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: hovered ? 'var(--color-accent)' : 'var(--color-muted-foreground)', flexShrink: 0, transition: 'color 0.15s' }}>
          Fiche →
        </div>
      </div>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}


