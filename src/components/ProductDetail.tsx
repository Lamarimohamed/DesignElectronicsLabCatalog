import { useState } from 'react'
import type { Product } from '../data/products'

interface ProductDetailProps {
  product: Product
  products: Product[]
  onBack: () => void
  onSelect: (p: Product) => void
}

export default function ProductDetail({ product, products, onBack, onSelect }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'description'>('specs')

  const related = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3)

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-0 mb-6" aria-label="Fil d'Ariane">
        <button
          onClick={onBack}
          className="flex items-center gap-1 transition-colors"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted-foreground)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--color-accent)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-muted-foreground)')}
        >
          ← Catalogue
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-border)', margin: '0 0.5rem' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {product.category}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-border)', margin: '0 0.5rem' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-foreground)', fontWeight: 500 }}>
          {product.ref}
        </span>
      </nav>

      {/* Product header band */}
      <div
        className="mb-8 p-0 border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
      >
        {/* Top: accent bar + document number */}
        <div
          className="flex items-center justify-between px-6 py-2 border-b"
          style={{ background: 'var(--color-foreground)', borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 3, height: 16, background: 'var(--color-accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Fiche Technique
            </span>
          </div>
          <div className="flex items-center gap-6">
            {product.norm && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                Norme : {product.norm}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
              Rév. A — 2024
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: product info */}
          <div className="flex-1 px-6 py-6 md:border-r" style={{ borderColor: 'var(--color-border)' }}>
            {/* Category + subcategory */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2 py-0.5 border"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted-foreground)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {product.category}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-border)' }}>›</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {product.subcategory}
              </span>
            </div>

            {/* Reference */}
            <div
              className="mb-1"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-accent)', fontWeight: 500, letterSpacing: '0.06em' }}
            >
              {product.ref}
            </div>

            {/* Product name */}
            <h1
              className="mb-4 leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.625rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: 'var(--color-foreground)',
              }}
            >
              {product.name}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    background: 'var(--color-secondary)',
                    color: 'var(--color-muted-foreground)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Availability + download */}
            <div className="flex items-center gap-4">
              <AvailabilityBadge availability={product.availability} />
              <DownloadButton pdfUrl={product.pdfUrl} />
            </div>
          </div>

          {/* Right: image */}
          <div
            className="md:flex-shrink-0 overflow-hidden"
            style={{ width: '100%', maxWidth: 380, height: 260, background: '#0F1923' }}
          >
            <img
              src={product.image}
              alt={`${product.name} — vue produit`}
              className="w-full h-full object-cover"
              style={{ opacity: 0.9 }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-stretch border-b mb-0" style={{ borderColor: 'var(--color-border)' }}>
        {(['specs', 'description'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-6 py-3 transition-colors"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: activeTab === tab ? 500 : 400,
              color: activeTab === tab ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
              marginBottom: -1,
              background: 'transparent',
            }}
          >
            {tab === 'specs' ? 'Spécifications Techniques' : 'Description'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {activeTab === 'specs' ? (
          <SpecsPanel product={product} />
        ) : (
          <DescriptionPanel product={product} />
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="mb-4"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-muted-foreground)' }}
          >
            Produits associés — {product.category}
          </div>
          <div className="flex gap-px" style={{ background: 'var(--color-border)' }}>
            {related.map(p => (
              <RelatedCard key={p.id} product={p} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SpecsPanel({ product }: { product: Product }) {
  return (
    <div className="flex-1 min-w-0">
      {/* Spec table header row */}
      <div
        className="border border-b-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Table title */}
        <div
          className="px-4 py-2 border-b flex items-center justify-between"
          style={{ background: 'var(--color-foreground)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Tableau de Caractéristiques
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
            {product.specs.length} paramètres
          </span>
        </div>

        <table className="spec-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '3rem' }} />
            <col style={{ width: '40%' }} />
            <col />
            <col style={{ width: '6rem' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>Paramètre</th>
              <th>Valeur</th>
              <th>Unité</th>
            </tr>
          </thead>
          <tbody>
            {product.specs.map((spec, i) => (
              <tr key={i}>
                <td className="param-index">P{String(i + 1).padStart(2, '0')}</td>
                <td className="param-name">
                  {spec.parameter}
                  {spec.note && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted-foreground)', fontWeight: 400, marginTop: 2 }}>
                      {spec.note}
                    </div>
                  )}
                </td>
                <td className="param-value">{spec.value}</td>
                <td className="param-unit">{spec.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div
        className="px-4 py-2 border border-t-0 flex items-center gap-2"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-secondary)' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" stroke="var(--color-muted-foreground)" strokeWidth="1"/>
          <line x1="5" y1="4" x2="5" y2="7" stroke="var(--color-muted-foreground)" strokeWidth="1"/>
          <circle cx="5" cy="3" r="0.5" fill="var(--color-muted-foreground)"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted-foreground)', letterSpacing: '0.04em' }}>
          Valeurs nominales à 25 °C, sous réserve de modifications sans préavis.
        </span>
      </div>
    </div>
  )
}

function DescriptionPanel({ product }: { product: Product }) {
  return (
    <div className="flex-1 max-w-2xl">
      <div
        className="border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="px-6 py-3 border-b"
          style={{ background: 'var(--color-foreground)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Description Technique
          </span>
        </div>
        <div className="px-6 py-6" style={{ background: 'var(--color-card)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-foreground)' }}>
            {product.description}
          </p>

          {product.norm && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)', marginBottom: 6 }}>
                Normes applicables
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-foreground)' }}>
                {product.norm}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AvailabilityBadge({ availability }: { availability: Product['availability'] }) {
  const colors = {
    stock: { bg: 'rgba(26,122,63,0.1)', border: 'rgba(26,122,63,0.3)', dot: 'var(--color-success)', text: 'var(--color-success)' },
    commande: { bg: 'rgba(184,92,0,0.08)', border: 'rgba(184,92,0,0.25)', dot: 'var(--color-warning)', text: 'var(--color-warning)' },
    discontinue: { bg: 'rgba(94,107,122,0.1)', border: 'var(--color-border)', dot: 'var(--color-muted-foreground)', text: 'var(--color-muted-foreground)' },
  }
  const labels = { stock: 'En stock', commande: 'Sur commande', discontinue: 'Discontinué' }
  const c = colors[availability]

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 border"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: c.dot, boxShadow: availability === 'stock' ? `0 0 5px ${c.dot}` : 'none' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: c.text, letterSpacing: '0.04em' }}>
        {labels[availability]}
      </span>
    </div>
  )
}

function DownloadButton({ pdfUrl }: { pdfUrl?: string }) {
  const disabled = !pdfUrl

  return (
    <a
      href={pdfUrl || undefined}
      target="_blank"
      rel="noreferrer"
      aria-disabled={disabled}
      onClick={e => { if (disabled) e.preventDefault() }}
      className="flex items-center gap-2 px-4 py-1.5 border transition-colors group"
      style={{
        borderColor: 'var(--color-border)',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textDecoration: 'none',
      }}
      onMouseOver={e => {
        if (disabled) return
        e.currentTarget.style.background = 'var(--color-foreground)'
        e.currentTarget.style.borderColor = 'var(--color-foreground)'
        e.currentTarget.querySelectorAll('span').forEach(el => { (el as HTMLElement).style.color = 'var(--color-primary-foreground)' })
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.querySelectorAll('span').forEach(el => { (el as HTMLElement).style.color = '' })
      }}
      title={disabled ? 'Aucune fiche PDF disponible' : 'Télécharger la fiche technique (PDF)'}
    >
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
        <path d="M6 1v8M6 9l-3-3M6 9l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
        <line x1="1" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {disabled ? 'Pas de PDF' : 'Datasheet PDF'}
      </span>
    </a>
  )
}

function RelatedCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex-1 flex flex-col cursor-pointer transition-colors"
      style={{
        background: hovered ? 'var(--color-card)' : 'var(--color-background)',
        borderLeft: hovered ? '2px solid var(--color-accent)' : '2px solid transparent',
        minWidth: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(product)}
      onKeyDown={e => e.key === 'Enter' && onSelect(product)}
      tabIndex={0}
      role="button"
    >
      <div style={{ height: 100, background: '#1a2230', overflow: 'hidden' }}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" style={{ opacity: 0.8 }} />
      </div>
      <div className="px-3 py-3">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 500 }}>{product.ref}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-foreground)', marginTop: 2, lineHeight: 1.3 }}>{product.name}</div>
      </div>
    </div>
  )
}
