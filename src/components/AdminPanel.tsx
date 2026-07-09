import { useState, useEffect } from 'react'
import type { Product, Availability } from '../data/products'
import { CATEGORIES } from '../data/products'
import { requireSupabase, isSupabaseConfigured } from '../lib/supabase'
import { seedDemoProducts, deleteProduct } from '../lib/productsApi'
import { uploadProductImage, getPublicUrl } from '../lib/storage'

interface AdminPanelProps {
  products: Product[]
  onSave: (product: Product) => Promise<void>
  onExit: () => void
  onProductsChange: (products: Product[]) => void
  onReload: () => Promise<void>
}

type AdminView = 'login' | 'list' | 'edit'


export default function AdminPanel({ products, onSave, onExit, onProductsChange, onReload }: AdminPanelProps) {
  const [adminView, setAdminView] = useState<AdminView>('login')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loginError, setLoginError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCheckingSession(false)
      return
    }

    let cancelled = false

    async function restoreSession() {
      try {
        const { data: { session } } = await requireSupabase().auth.getSession()
        if (!cancelled && session) {
          setAdminView('list')
        }
      } finally {
        if (!cancelled) setCheckingSession(false)
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setLoginError('Supabase n\'est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.')
      return
    }

    setLoginError('')
    const { error } = await requireSupabase().auth.signInWithPassword({ email, password })
    if (error) {
      setLoginError('Identifiants incorrects.')
      return
    }
    setAdminView('list')
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await requireSupabase().auth.signOut()
    }
    setAdminView('login')
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setAdminView('edit')
    setActionError('')
  }

  const handleNew = () => {
    setEditingProduct(null)
    setAdminView('edit')
    setActionError('')
  }

  const handleSave = async (product: Product) => {
    setSaving(true)
    setActionError('')
    try {
      await onSave(product)
      setAdminView('list')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Supprimer définitivement "${product.name}" (${product.ref}) ?`)) return
    setDeletingId(product.id)
    setActionError('')
    try {
      await deleteProduct(product.id)
      onProductsChange(products.filter(p => p.id !== product.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Suppression impossible.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    setActionError('')
    try {
      const seeded = await seedDemoProducts()
      onProductsChange(seeded)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Import impossible.')
    } finally {
      setSeeding(false)
    }
  }

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#666' }}>Vérification de la session…</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', fontFamily: 'var(--font-sans)' }}>
      {/* Admin header — deliberately plain */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0E0E0', padding: '0 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {adminView !== 'login' && (
              <>
                <button
                  onClick={() => setAdminView('list')}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#666', background: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}
                >
                  Produits
                </button>
                {adminView === 'edit' && (
                  <>
                    <span style={{ color: '#CCC' }}>/</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#333' }}>
                      {editingProduct ? `Modifier — ${editingProduct.ref}` : 'Nouveau produit'}
                    </span>
                  </>
                )}
              </>
            )}
            {adminView === 'login' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#333', letterSpacing: '0.04em' }}>
                Administration — ElectraLab
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {adminView !== 'login' && (
              <button
                onClick={handleLogout}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#999', background: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}
              >
                Déconnexion
              </button>
            )}
            <button
              onClick={onExit}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#999', background: 'none', cursor: 'pointer', letterSpacing: '0.04em' }}
            >
              ← Retour au catalogue
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {actionError && (
          <div style={{ marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', padding: '8px 10px', background: 'rgba(200,55,10,0.06)', border: '1px solid rgba(200,55,10,0.2)' }}>
            {actionError}
          </div>
        )}
        {adminView === 'login' && (
          <LoginForm onLogin={handleLogin} error={loginError} />
        )}
        {adminView === 'list' && (
          <ProductList
            products={products}
            onEdit={handleEdit}
            onNew={handleNew}
            onSeed={handleSeed}
            seeding={seeding}
            onRefresh={onReload}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
        {adminView === 'edit' && (
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={() => setAdminView('list')}
            saving={saving}
          />
        )}
      </div>
    </div>
  )
}

function LoginForm({ onLogin, error }: { onLogin: (email: string, password: string) => Promise<void>; error: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <div style={{ maxWidth: 360, margin: '60px auto 0' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#111', marginBottom: 24 }}>
        Connexion
      </div>

      <form
        onSubmit={async e => {
          e.preventDefault()
          setSubmitting(true)
          await onLogin(email, password)
          setSubmitting(false)
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <Field label="E-mail" id="email">
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="admin@votredomaine.com"
            style={adminInputStyle()}
          />
        </Field>

        <Field label="Mot de passe" id="password">
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            style={adminInputStyle()}
          />
        </Field>

        {error && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', padding: '8px 10px', background: 'rgba(200,55,10,0.06)', border: '1px solid rgba(200,55,10,0.2)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{ marginTop: 8, background: '#111', color: '#FFF', border: 'none', padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#AAA', lineHeight: 1.5 }}>
        Utilisez un compte créé dans Supabase Auth (Authentication → Users).
      </div>
    </div>
  )
}

function ProductList({
  products,
  onEdit,
  onNew,
  onSeed,
  seeding,
  onRefresh,
  onDelete,
  deletingId,
}: {
  products: Product[]
  onEdit: (p: Product) => void
  onNew: () => void
  onSeed: () => Promise<void>
  seeding: boolean
  onRefresh: () => Promise<void>
  onDelete: (p: Product) => Promise<void>
  deletingId: string | null
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#111' }}>
            Produits
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
            {products.length} références
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {products.length === 0 && isSupabaseConfigured && (
            <button
              onClick={onSeed}
              disabled={seeding}
              style={{ background: 'none', color: '#555', border: '1px solid #CCC', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: seeding ? 'wait' : 'pointer' }}
            >
              {seeding ? 'Import…' : 'Importer le catalogue démo'}
            </button>
          )}
          <button
            onClick={() => onRefresh()}
            style={{ background: 'none', color: '#555', border: '1px solid #CCC', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Actualiser
          </button>
          <button
            onClick={onNew}
            style={{ background: '#111', color: '#FFF', border: 'none', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            + Nouveau produit
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #E0E0E0', background: '#FFF' }} className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #111' }}>
              <Th>Référence</Th>
              <Th>Nom</Th>
              <Th>Catégorie</Th>
              <Th>Disponibilité</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#333' }}>{p.ref}</td>
                <td style={{ padding: '10px 12px', color: '#111', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '10px 12px', color: '#666', fontSize: '0.8125rem' }}>{p.category}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    padding: '2px 8px',
                    background: p.availability === 'stock' ? 'rgba(26,122,63,0.1)' : p.availability === 'commande' ? 'rgba(184,92,0,0.1)' : '#F0F0F0',
                    color: p.availability === 'stock' ? '#1A7A3F' : p.availability === 'commande' ? '#B85C00' : '#888',
                  }}>
                    {p.availability === 'stock' ? 'En stock' : p.availability === 'commande' ? 'Commande' : 'Discontinué'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onEdit(p)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#555', background: 'none', border: '1px solid #DDD', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.04em' }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    disabled={deletingId === p.id}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--color-accent)',
                      background: 'none',
                      border: '1px solid rgba(200,55,10,0.3)',
                      padding: '4px 10px',
                      cursor: deletingId === p.id ? 'wait' : 'pointer',
                      letterSpacing: '0.04em',
                      opacity: deletingId === p.id ? 0.6 : 1,
                    }}
                  >
                    {deletingId === p.id ? '…' : 'Supprimer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductForm({ product, onSave, onCancel, saving }: { product: Product | null; onSave: (p: Product) => Promise<void>; onCancel: () => void; saving: boolean }) {
  const [form, setForm] = useState({
    ref: product?.ref ?? '',
    name: product?.name ?? '',
    category: product?.category ?? CATEGORIES[0],
    subcategory: product?.subcategory ?? '',
    description: product?.description ?? '',
    shortDesc: product?.shortDesc ?? '',
    image: product?.image ?? '',
    pdfUrl: product?.pdfUrl ?? '',
    availability: (product?.availability ?? 'stock') as Availability,
    norm: product?.norm ?? '',
    tags: product?.tags.join(', ') ?? '',
    specs: product
      ? product.specs.map(s => `${s.parameter}|${s.value}|${s.unit}${s.note ? '|' + s.note : ''}`).join('\n')
      : '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.ref.trim()) e.ref = 'La référence est obligatoire.'
    if (!form.name.trim()) e.name = 'Le nom est obligatoire.'
    if (!form.shortDesc.trim()) e.shortDesc = 'La description courte est obligatoire.'
    return e
  }

  const handleImageUpload = async (file: File) => {
    if (!isSupabaseConfigured) {
      alert('Supabase non configuré. Utilisez une URL.')
      return
    }
    try {
      setUploadingImage(true)
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase()
      const path = `products/${form.ref}/${timestamp}-${sanitizedName}`
      await uploadProductImage(path, file)
      const publicUrl = getPublicUrl(path)
      if (publicUrl) {
        setForm(f => ({ ...f, image: publicUrl }))
      }
    } catch (err) {
      alert(`Erreur lors du chargement : ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handlePdfUpload = async (file: File) => {
    if (!isSupabaseConfigured) {
      alert('Supabase non configuré. Collez le texte directement.')
      return
    }
    try {
      setUploadingPdf(true)
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase()
      const path = `product-pdfs/${form.ref}/${timestamp}-${sanitizedName}`
      await uploadProductImage(path, file)
      const publicUrl = getPublicUrl(path)
      if (publicUrl) {
        setForm(f => ({ ...f, pdfUrl: publicUrl }))
        alert(`PDF chargé. URL publique enregistrée.`)
      } else {
        alert(`PDF chargé, mais impossible d'obtenir l'URL publique.`)
      }
    } catch (err) {
      alert(`Erreur lors du chargement PDF : ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const specs = form.specs.trim()
      ? form.specs.split('\n').filter(Boolean).map(line => {
          const [parameter, value, unit, note] = line.split('|')
          return { parameter: parameter?.trim() ?? '', value: value?.trim() ?? '', unit: unit?.trim() ?? '', note: note?.trim() }
        })
      : (product?.specs ?? [])

    const saved: Product = {
      id: product?.id ?? form.ref.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ref: form.ref.trim(),
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory.trim(),
      description: form.description.trim(),
      shortDesc: form.shortDesc.trim(),
      image: form.image.trim() || (product?.image ?? ''),
      pdfUrl: form.pdfUrl?.trim() || (product?.pdfUrl ?? undefined),
      availability: form.availability,
      norm: form.norm.trim() || undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      specs,
    }
    await onSave(saved)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#111', marginBottom: 24 }}>
        {product ? `Modifier — ${product.ref}` : 'Nouveau produit'}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Section: Identification */}
        <SectionLabel>Identification</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Référence *" id="ref" error={errors.ref}>
            <input id="ref" type="text" value={form.ref} onChange={set('ref')} placeholder="ILP-450-LED" style={adminInputStyle(errors.ref)} />
          </Field>
          <Field label="Disponibilité" id="avail">
            <select id="avail" value={form.availability} onChange={set('availability')} style={adminInputStyle()}>
              <option value="stock">En stock</option>
              <option value="commande">Sur commande</option>
              <option value="discontinue">Discontinué</option>
            </select>
          </Field>
        </div>

        <Field label="Nom du produit *" id="name" error={errors.name}>
          <input id="name" type="text" value={form.name} onChange={set('name')} placeholder="Luminaire LED Industriel Haute Baie" style={adminInputStyle(errors.name)} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Catégorie" id="category">
            <select id="category" value={form.category} onChange={set('category')} style={adminInputStyle()}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Sous-catégorie" id="subcat">
            <input id="subcat" type="text" value={form.subcategory} onChange={set('subcategory')} placeholder="Haute baie" style={adminInputStyle()} />
          </Field>
        </div>

        {/* Section: Content */}
        <SectionLabel>Contenu</SectionLabel>
        <Field label="Description courte *" id="shortDesc" error={errors.shortDesc}>
          <input id="shortDesc" type="text" value={form.shortDesc} onChange={set('shortDesc')} placeholder="Description en une ligne pour la liste catalogue" style={adminInputStyle(errors.shortDesc)} />
        </Field>

        <Field label="Description technique" id="description">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea id="description" value={form.description} onChange={set('description')} rows={5} placeholder="Description complète pour la fiche produit..." style={adminInputStyle()} />
            <label style={{ display: 'block', padding: '10px 10px', border: '2px dashed #D8D8D8', background: '#FAFAFA', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#666' }}>
              {uploadingPdf ? 'Chargement PDF…' : '📄 Charger un PDF (fiche technique / datasheet)'}
              <input
                type="file"
                accept="application/pdf"
                onChange={e => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                disabled={uploadingPdf}
                style={{ display: 'none' }}
              />
            </label>
            {form.pdfUrl && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#333', marginTop: 6 }}>
                PDF: <a href={form.pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#1A73E8' }}>Ouvrir le PDF</a>
                <button type="button" onClick={() => setForm(f => ({ ...f, pdfUrl: '' }))} style={{ marginLeft: 8, background: 'none', border: '1px solid #DDD', padding: '4px 8px', cursor: 'pointer' }}>Supprimer</button>
              </div>
            )}
          </div>
        </Field>

        {/* Section: Media */}
        <SectionLabel>Média et classification</SectionLabel>

        <Field label="Image du produit">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.image && (
              <div style={{ position: 'relative', width: '100%', maxWidth: 300, marginBottom: 8 }}>
                <img src={form.image} alt="Preview" style={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'contain', border: '1px solid #E0E0E0' }} />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, image: '' }))}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#FFF', border: 'none', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={{ display: 'block', padding: '12px 10px', border: '2px dashed #D8D8D8', background: '#FAFAFA', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#666' }}>
                  {uploadingImage ? 'Chargement…' : '📁 Depuis appareil'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <Field label="Ou URL image" id="image">
                <input id="image" type="url" value={form.image} onChange={set('image')} placeholder="https://images.unsplash.com/…" style={adminInputStyle()} />
              </Field>
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Norme(s)" id="norm">
            <input id="norm" type="text" value={form.norm} onChange={set('norm')} placeholder="EN 60598-1, IEC 62031" style={adminInputStyle()} />
          </Field>
          <Field label="Tags (séparés par virgule)" id="tags">
            <input id="tags" type="text" value={form.tags} onChange={set('tags')} placeholder="LED, IP65, IK08" style={adminInputStyle()} />
          </Field>
        </div>

        {/* Section: Specs */}
        <SectionLabel>Spécifications techniques</SectionLabel>
        <Field label='Format : "Paramètre|Valeur|Unité|Note (optionnelle)" — une ligne par paramètre' id="specs">
          <textarea
            id="specs"
            value={form.specs}
            onChange={set('specs')}
            rows={10}
            placeholder={"Tension d'alimentation|220–240|V AC|±10 %\nPuissance absorbée|45|W\nFlux lumineux|4 500|lm"}
            style={{ ...adminInputStyle(), fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
          />
        </Field>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #E0E0E0' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ background: '#111', color: '#FFF', border: 'none', padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', color: '#555', border: '1px solid #CCC', padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

// Shared input style for admin forms
export const adminInputStyle = (error?: string): React.CSSProperties => ({
  width: '100%',
  border: error ? '1px solid rgba(200,55,10,0.6)' : '1px solid #D8D8D8',
  padding: '8px 10px',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.875rem',
  color: '#111',
  background: '#FFF',
  outline: 'none',
  borderRadius: 0,
  resize: 'vertical' as const,
})

function Field({ label, id, children, error }: { label: string; id: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label
        htmlFor={id}
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666' }}
      >
        {label}
      </label>
      {children}
      {error && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-accent)' }}>{error}</span>}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AAA', borderBottom: '1px solid #E8E8E8', paddingBottom: 6, marginBottom: -4 }}>
      {children}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', fontWeight: 500, background: '#F7F7F7' }}>
      {children}
    </th>
  )
}
