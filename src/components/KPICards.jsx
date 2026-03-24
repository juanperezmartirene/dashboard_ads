const CARDS = [
  {
    label: 'Total de anuncios',
    value: '12.096',
    sub: 'Oct 2023 – Nov 2024',
    accent: '#3B82F6',
  },
  {
    label: 'Tipo dominante',
    value: 'Promoción',
    sub: '86,2 % del total · F1: 0,86',
    accent: '#6366F1',
  },
  {
    label: 'Partidos políticos',
    value: '4',
    sub: 'FA · PN · PC · Otros',
    accent: '#10B981',
  },
  {
    label: 'Etapas electorales',
    value: '3',
    sub: 'Internas · Nacionales · Ballottage',
    accent: '#F59E0B',
  },
]

export default function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-sm px-6 py-5"
          style={{ borderTop: `3px solid ${card.accent}` }}
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
            {card.label}
          </p>
          <p
            className="font-mono font-bold text-gray-900 leading-none mb-2"
            style={{ fontSize: '2rem' }}
          >
            {card.value}
          </p>
          <p className="text-xs text-gray-400 leading-snug">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
