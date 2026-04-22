import { motion } from 'motion/react'
import { AnimatedNumber } from './Layout'

// ─── KPIs ─────────────────────────────────────────────────────────────────────

const KPI_ACCENTS = ['#173363', '#0096D1', '#10B981', '#6366F1', '#D97706']

export function HomeKPIs({ stats, compact }) {
  const items = [
    { label: 'Anuncios',        value: stats.totalAnuncios, format: v => Math.round(v).toLocaleString('es-UY'),                                                             desc: 'Total de anuncios publicados en el período' },
    { label: 'Gasto estimado',  value: stats.totalGasto,   format: v => `U$S ${Math.round(v).toLocaleString('es-UY')}`,                                                     desc: 'Inversión total estimada por Meta Ad Library' },
    { label: 'Impresiones est.',value: stats.totalImp,     format: v => v >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : Math.round(v).toLocaleString('es-UY'),                     desc: 'Veces que los anuncios fueron mostrados' },
    { label: 'Cuentas',         value: stats.cuentas,      format: v => Math.round(v).toLocaleString('es-UY'),                                                              desc: 'Páginas de Facebook o Instagram únicas' },
    { label: 'Imp. por dólar',  value: stats.impDolar,     format: v => Math.round(v).toLocaleString('es-UY'),                                                              desc: 'Eficiencia media: impresiones por U$S gastado' },
  ]

  if (compact) {
    // Fila 1: Anuncios · Cuentas · Imp/dólar  |  Fila 2: Impresiones · Gasto
    const row1 = [
      { ...items[0], accent: KPI_ACCENTS[0] },
      { ...items[3], accent: KPI_ACCENTS[3] },
      { ...items[4], accent: KPI_ACCENTS[4] },
    ]
    const row2 = [
      { ...items[2], accent: KPI_ACCENTS[2] },
      { ...items[1], accent: KPI_ACCENTS[1] },
    ]
    const Card = ({ k }) => (
      <div
        className="bg-white border border-gray-200 rounded-sm px-3 py-2"
        style={{ borderTop: `2px solid ${k.accent}` }}
      >
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5 leading-tight truncate">
          {k.label}
        </p>
        <p className="font-mono font-bold text-gray-900 leading-none truncate text-sm">
          <AnimatedNumber value={k.value} format={k.format} />
        </p>
      </div>
    )
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {row1.map(k => <Card key={k.label} k={k} />)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {row2.map(k => <Card key={k.label} k={k} />)}
        </div>
      </div>
    )
  }

  return (
    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
      {items.map((k, i) => (
        <motion.div
          key={k.label}
          layout
          className="bg-white border border-gray-200 rounded-sm px-4 py-3"
          style={{ borderTop: `3px solid ${KPI_ACCENTS[i]}` }}
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1 leading-snug">
            {k.label}
          </p>
          <p className="font-mono font-bold text-gray-900 leading-none truncate" style={{ fontSize: '1.1rem' }}>
            <AnimatedNumber value={k.value} format={k.format} />
          </p>
          <p className="text-[10px] text-gray-400 leading-snug mt-1.5">{k.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
