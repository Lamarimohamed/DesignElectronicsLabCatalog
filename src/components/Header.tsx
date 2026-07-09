import type { View } from '../App'

interface HeaderProps {
  view: View
  onNavigate: (v: View) => void
}

export default function Header({ view, onNavigate }: HeaderProps) {
  return (
    <header className="grid-bg border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-0">
        <div className="flex items-stretch justify-between" style={{ minHeight: '64px' }}>
          {/* Logo / wordmark */}
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-3 py-4 group focus-visible:outline-none"
          >
            {/* Logo image, same as favicon */}
            <div className="relative flex-shrink-0" style={{ width: 28, height: 28 }}>
              <img src="/favicon.svg" alt="ElectronicCatalog Logo" style={{ width: 28, height: 28 }} />
            </div>

            <div className="flex flex-col items-start">
              <span
                className="leading-none tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#FFFFFF', letterSpacing: '0.12em' }}
              >
                ElectronicCatalog
              </span>
              <span
                className="leading-none mt-0.5"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 300, fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}
              >
                CATALOGUE TECHNIQUE
              </span>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex items-stretch gap-0" role="navigation" aria-label="Navigation principale">
            <NavLink active={view === 'catalog'} onClick={() => onNavigate('catalog')}>
              Catalogue
            </NavLink>
            <NavLink active={view === 'admin'} onClick={() => onNavigate('admin')}>
              Administration
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div style={{ height: 2, background: 'var(--color-accent)', width: '100%' }} />
    </header>
  )
}

function NavLink({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative px-3 sm:px-5 flex items-center transition-colors duration-150"
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: '0.8125rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 2, background: 'var(--color-accent)' }}
        />
      )}
      {children}
    </button>
  )
}
