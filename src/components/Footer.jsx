const LINKS = [
  { id: 'home',        label: 'Inicio'      },
  { id: 'gastos',      label: 'Gastos'      },
  { id: 'tipos',       label: 'Tipos'       },
  { id: 'metodologia', label: 'Metodología' },
  { id: 'equipo',      label: 'Equipo'      },
]

export default function Footer({ page, onNavigate }) {
  return (
    <footer style={{ backgroundColor: '#173363' }} className="mt-0">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-4">
            {LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="text-xs transition-colors"
                style={{ color: page === link.id ? '#0096D1' : 'rgba(255,255,255,0.45)' }}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span>Última actualización: abril 2026</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
