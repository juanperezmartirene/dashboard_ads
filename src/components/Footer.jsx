const LINKS = [
  { id: 'home',        label: 'Inicio'      },
  { id: 'metodologia', label: 'Metodología' },
  { id: 'equipo',      label: 'Equipo'      },
]

export default function Footer({ page, onNavigate }) {
  return (
    <footer style={{ backgroundColor: '#111827' }} className="mt-0">
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">
        <div className="grid grid-cols-3 gap-10 mb-10">

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Metodología
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Los anuncios fueron clasificados de forma automática mediante ROUBERTa,
              entrenado sobre un subconjunto etiquetado manualmente. La clasificación es
              multi-etiqueta: un anuncio puede pertenecer a más de un tipo
              simultáneamente.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Fuente de datos
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Meta Ad Library API. Los datos de impresiones son rangos estimados
              provistos por Meta. Los datos presentados son sintéticos y serán
              reemplazados por los datos reales del corpus al finalizar el
              procesamiento.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Referencias
            </p>
            <ul className="text-xs text-gray-500 leading-relaxed space-y-1">
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

        <div className="pt-6 border-t border-gray-800 flex items-center justify-between">
          <div className="flex gap-4">
            {LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`text-xs transition-colors ${
                  page === link.id
                    ? 'text-gray-300'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex gap-6 text-xs text-gray-600">
            <span>Datos sintéticos · Última actualización: 24/03/2026</span>
            <span>Uruguay · Ciclo electoral 2023–2024</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
