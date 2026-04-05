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
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-10">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#0096D1' }}>
              Metodología
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Los anuncios fueron clasificados de forma automática mediante ROUBERTa,
              entrenado sobre un subconjunto etiquetado manualmente. La clasificación es
              multi-etiqueta: un anuncio puede pertenecer a más de un tipo
              simultáneamente.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#0096D1' }}>
              Fuente de datos
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Meta Ad Library API. Los datos de impresiones son rangos estimados
              provistos por Meta. Los datos presentados son sintéticos y serán
              reemplazados por los datos reales del corpus al finalizar el
              procesamiento.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#0096D1' }}>
              Referencias
            </p>
            <ul className="text-xs leading-relaxed space-y-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <li>Benoit, W. L. (1999). <em>Seeing spots.</em> Praeger.</li>
              <li>
                Fridkin, K. &amp; Kenney, P. (2011). Variability in citizens'
                reactions to different types of negative campaigns.{' '}
                <em>AJPS</em>, 55(2).
              </li>
              <li>Meta Ad Library API Docs.</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
            <span>Datos sintéticos · Última actualización: 24/03/2026</span>
            <span>Uruguay · Ciclo electoral 2023–2024</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
