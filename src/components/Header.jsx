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

export default function Header({ page, onNavigate }) {
  const hero = PAGE_HEROES[page] || PAGE_HEROES.home
  const sections = page === 'home' ? HOME_SECTIONS : page === 'metodologia' ? METOD_SECTIONS : []

  return (
    <header style={{ backgroundColor: '#111827' }}>
      {/* Top bar — site identity + page navigation */}
      <div style={{ borderBottom: '1px solid #1F2937' }}>
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-11">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase">
            Uruguay · Meta · 2023–2024
          </span>
          <nav className="flex gap-1">
            {PAGE_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  page === link.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-8 pt-10 pb-4">
        <h1
          className="font-semibold text-white leading-tight"
          style={{ fontSize: page === 'home' ? undefined : '1.5rem', maxWidth: '36rem' }}
        >
          {hero.title}
        </h1>
        <p className="text-gray-400 text-sm mt-3 max-w-xl leading-relaxed">
          {hero.sub}
        </p>
      </div>

      {/* Section anchor nav */}
      {sections.length > 0 && (
        <nav style={{ borderTop: '1px solid #1F2937' }} className="max-w-6xl mx-auto px-8">
          <ul className="flex gap-6 overflow-x-auto">
            {sections.map(link => (
              <li key={link.href} className="shrink-0">
                <a
                  href={link.href}
                  className="block py-3 text-xs font-medium text-gray-500 hover:text-gray-200 border-b-2 border-transparent hover:border-gray-400 transition-colors"
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
