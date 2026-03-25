import { useState } from 'react'

const PAGE_LINKS = [
  { id: 'home',        label: 'Inicio'      },
  { id: 'metodologia', label: 'Metodología' },
  { id: 'equipo',      label: 'Equipo'      },
]

const HOME_SECTIONS = [
  { href: '#resultados', label: 'Resultados'  },
  { href: '#temporal',   label: 'Evolución'   },
  { href: '#partidos',   label: 'Por partido' },
  { href: '#territorial',label: 'Territorio'  },
  { href: '#datos',      label: 'Datos'       },
]

const METOD_SECTIONS = [
  { href: '#estudio',   label: 'El estudio' },
  { href: '#tipologia', label: 'Tipología'  },
  { href: '#corpus',    label: 'El corpus'  },
]

const PAGE_HEROES = {
  home: {
    title: 'Publicidad política digital en Meta durante las elecciones uruguayas 2024',
    sub: 'Análisis de 12.096 anuncios publicados por los principales partidos políticos en Facebook e Instagram a lo largo de tres etapas electorales.',
  },
  metodologia: {
    title: 'Metodología',
    sub: 'Cómo recolectamos, etiquetamos y clasificamos los anuncios. Qué mide cada categoría.',
  },
  equipo: {
    title: 'El equipo',
    sub: 'Investigadores en comunicación política, análisis computacional de texto y estudios electorales.',
  },
}

const NAV_BORDER = 'rgba(255,255,255,0.1)'

export default function Header({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const hero = PAGE_HEROES[page] || PAGE_HEROES.home
  const sections = page === 'home' ? HOME_SECTIONS : page === 'metodologia' ? METOD_SECTIONS : []

  return (
    <header style={{ backgroundColor: '#173363' }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${NAV_BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-12">

          {/* Desktop: identity label */}
          <span className="hidden sm:block text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Uruguay · Meta · 2023–2024
          </span>

          {/* Desktop nav */}
          <nav className="hidden sm:flex gap-1">
            {PAGE_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                style={page === link.id
                  ? { backgroundColor: '#0096D1', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.65)' }
                }
                className="px-4 py-2 text-sm font-medium rounded transition-colors hover:bg-white/10"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile: label + hamburger */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Uruguay · Meta · 2024
            </span>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 -mr-2"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden px-4 py-2" style={{ borderTop: `1px solid ${NAV_BORDER}`, backgroundColor: '#0f2347' }}>
            {PAGE_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => { onNavigate(link.id); setMenuOpen(false) }}
                style={page === link.id ? { backgroundColor: '#0096D1', color: '#fff' } : { color: 'rgba(255,255,255,0.7)' }}
                className="block w-full text-left px-4 py-3 text-sm font-medium rounded transition-colors mb-1 hover:bg-white/10"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-4">
        <h1 className="font-semibold text-white leading-tight text-xl md:text-2xl" style={{ maxWidth: '36rem' }}>
          {hero.title}
        </h1>
        <p className="text-sm mt-3 max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {hero.sub}
        </p>
      </div>

      {/* Section anchor nav — teal pills */}
      {sections.length > 0 && (
        <nav style={{ borderTop: `1px solid ${NAV_BORDER}` }} className="max-w-6xl mx-auto px-4 md:px-8">
          <ul className="flex gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
            {sections.map(link => (
              <li key={link.href} className="shrink-0">
                <a
                  href={link.href}
                  className="block px-4 py-2 text-xs font-semibold text-white rounded-full transition-colors whitespace-nowrap"
                  style={{ backgroundColor: '#0096D1', opacity: 0.9 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
