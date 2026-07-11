import type { View } from '../App'

interface FooterProps {
  onNavigate: (v: View) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="grid-bg border-t mt-auto text-white/70" style={{ borderColor: 'rgba(255,255,255,0.12)', background: '#1E3FA8' /* Blue background */ }}>
      {/* Top accent bar */}
      <div style={{ height: 2, background: '#1E3FA8', width: '100%' }} />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand block */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-3 self-start focus-visible:outline-none"
            >
                          <img src="/logo.jpg" alt="Bright LED Logo" style={{ height: 48, width: 'auto' }} />
              <div className="border-l border-white/20 pl-3">
                <span className="block text-[0.6rem] font-mono tracking-wider text-white/40">
                  CATALOGUE TECHNIQUE
                </span>
              </div>
            </button>
            <p className="text-sm font-sans text-white/50 max-w-sm mt-2 leading-relaxed">
              Composants et solutions d'éclairage LED haute performance pour l'industrie, le tertiaire et les environnements techniques exigeants.
            </p>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono tracking-wider text-white uppercase mb-1">
              Contact & Support
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-mono text-xs w-16">Tél:</span>
                <a href="tel:+33123456789" className="hover:text-white transition-colors duration-150 font-mono">
                  +33 (0)1 23 45 67 89
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 font-mono text-xs w-16">Email:</span>
                <a href="mailto:contact@brightled.com" className="hover:text-white transition-colors duration-150 font-mono">
                  contact@brightled.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-white/40 font-mono text-xs w-16 mt-0.5">Adresse:</span>
                <span className="text-white/60">
                  12 Rue de l'Électricité<br />
                  75008 Paris, France
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono tracking-wider text-white uppercase mb-1">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-white transition-colors duration-150 text-left font-sans cursor-pointer"
                >
                  Catalogue Produits
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors duration-150 text-left font-sans cursor-pointer"
                >
                  Espace Administration
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-150 font-sans"
                  onClick={(e) => e.preventDefault()}
                >
                  Mentions Légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/30" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span>
            © {new Date().getFullYear()} Bright LED. Tous droits réservés.
          </span>
          <span className="text-right">
            Conçu pour l'ingénierie & la technique
          </span>
        </div>
      </div>
    </footer>
  )
}
