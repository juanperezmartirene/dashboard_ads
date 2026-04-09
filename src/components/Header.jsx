import { useState } from 'react'
import { BookOpenIcon } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const PAGE_LINKS = [
  { id: 'home',          label: 'Inicio'         },
  { id: 'comparacion',   label: 'Comparación'    },
  { id: 'clasificacion', label: 'Clasificación'   },
  { id: 'metodologia',   label: 'Metodología'     },
  { id: 'equipo',        label: 'Equipo'          },
]


const PAGE_HEROES = {
  home: {
    title: 'Publicidad política digital en Meta durante las elecciones uruguayas 2024',
    sub: 'Análisis de todos los anuncios realizados por cuentas institucionales, partidarias y personales vinculadas a actores políticos en las elecciones presidenciales de 2024',
  },
  comparacion: {
    title: 'Comparación de conjuntos de anuncios',
    sub: 'Aplicá filtros independientes en cada panel para contrastar partidos, etapas electorales o territorios de forma simultánea.',
  },
  clasificacion: {
    title: 'Clasificación de anuncios · ROUBERTa',
    sub: 'Clasificación de 12.096 anuncios en seis categorías funcionales mediante aprendizaje automático supervisado. Distribución por etapa electoral, partido político y alcance territorial.',
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
  const [open, setOpen] = useState(false)
  const hero = PAGE_HEROES[page] || PAGE_HEROES.home

  return (
    <header style={{ backgroundColor: '#173363' }}>
      {/* ── Barra de navegación principal ── */}
      <div
        className="sticky top-0 z-50 w-full border-b"
        style={{
          backgroundColor: 'rgba(23,51,99,0.95)',
          borderBottomColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-8">

          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <BookOpenIcon className="size-5" style={{ color: '#0096D1' }} />
            <span className="font-mono text-sm font-bold text-white tracking-tight">
              Meta Política UY
            </span>
          </button>

          {/* Desktop: links */}
          <div className="hidden items-center gap-1 lg:flex">
            {PAGE_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="px-4 py-2 text-sm font-medium rounded transition-colors hover:bg-white/10"
                style={
                  page === link.id
                    ? { backgroundColor: '#0096D1', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.70)' }
                }
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile: hamburger */}
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </Button>
        </nav>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showClose={false}
          style={{
            backgroundColor: 'rgba(23,51,99,0.97)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-8 px-1 pt-2">
            <BookOpenIcon className="size-5" style={{ color: '#0096D1' }} />
            <span className="font-mono text-sm font-bold text-white">Meta Política UY</span>
          </div>
          <div className="grid gap-y-1">
            {PAGE_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => { onNavigate(link.id); setOpen(false) }}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded transition-colors text-left hover:bg-white/10"
                style={
                  page === link.id
                    ? { backgroundColor: '#0096D1', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.75)' }
                }
              >
                {link.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Hero ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-4">
        <h1 className="font-semibold text-white leading-tight text-xl md:text-2xl" style={{ maxWidth: '36rem' }}>
          {hero.title}
        </h1>
        <p className="text-sm mt-3 max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {hero.sub}
        </p>
      </div>

    </header>
  )
}
