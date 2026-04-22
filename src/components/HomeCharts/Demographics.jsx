import { useState } from 'react'
import DemoPyramid from '../DemoPyramid'
import { cn } from '../../lib/utils'

// ─── Top 5 cuentas ────────────────────────────────────────────────────────────

const PARTY_SHORT = {
  'Partido Nacional': 'PN', 'Frente Amplio': 'FA', 'Partido Colorado': 'PC',
  'Otros': 'Otros', 'Apoyo a múltiples': '···',
}
const PARTY_COLORS_MAP = {
  'Partido Nacional': '#0EA5E9', 'Frente Amplio': '#EAB308',
  'Partido Colorado': '#EF4444', 'Otros': '#6B7280', 'Apoyo a múltiples': '#9CA3AF',
}

export function HomeTop5({ top5, pagePartyMap }) {
  const cols = [
    { key: 'anuncios',    label: 'Por anuncios',    fmt: v => v.toLocaleString('es-UY') },
    { key: 'gasto',       label: 'Por gasto',       fmt: v => `U$S ${v.toLocaleString('es-UY')}` },
    { key: 'impresiones', label: 'Por impresiones', fmt: v => v > 1e6 ? (v / 1e6).toFixed(1) + ' M' : v.toLocaleString('es-UY') },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cols.map(col => (
        <div key={col.key}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">{col.label}</p>
          <div className="space-y-1.5">
            {top5.map((row, i) => {
              const item = row[col.key]
              if (!item) return null
              const info = pagePartyMap?.get(item.nombre)
              const partido = info?.partido
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-300 w-4 shrink-0">{i + 1}</span>
                  {partido && (
                    <span
                      className="text-[9px] font-mono px-1 py-0.5 rounded-sm shrink-0"
                      style={{ backgroundColor: (PARTY_COLORS_MAP[partido] || '#9CA3AF') + '22', color: PARTY_COLORS_MAP[partido] || '#9CA3AF' }}
                    >
                      {PARTY_SHORT[partido] || partido.slice(0, 2)}
                    </span>
                  )}
                  <span className="text-xs text-gray-700 flex-1 truncate">{item.nombre}</span>
                  <span className="text-xs font-mono text-gray-500 shrink-0">{col.fmt(item.valor)}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Pirámide demográfica ─────────────────────────────────────────────────────

const DEMO_METRICS = [
  { key: 'impresiones', label: 'Impresiones' },
  { key: 'gasto',       label: 'Gasto'       },
]

export function HomeDemoPyramid({ data, loading, gastoGenero, metric = 'impresiones', onMetricChange }) {
  if (loading) {
    return (
      <div className="space-y-2 py-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-2 items-center">
            <div className="w-8 h-3 bg-gray-100 rounded animate-pulse shrink-0" />
            <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ flex: 1, opacity: 0.3 + i * 0.12 }} />
            <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ flex: 1, opacity: 0.3 + i * 0.12 }} />
          </div>
        ))}
        <p className="text-[10px] text-gray-400 text-center mt-2">Cargando datos demográficos…</p>
      </div>
    )
  }
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-400 italic py-4 text-center">Sin datos demográficos disponibles.</p>
  }

  const totalGasto = gastoGenero ? gastoGenero.hombres + gastoGenero.mujeres : 0

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {DEMO_METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => onMetricChange?.(m.key)}
            className={cn(
              'text-xs px-2.5 py-1 rounded border transition-colors',
              metric === m.key
                ? 'border-sky-500 text-sky-700 bg-sky-50 font-medium'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <DemoPyramid data={data} metric={metric} />

      {metric === 'gasto' && gastoGenero && totalGasto > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Gasto estimado por género</p>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">Mujeres</span>
                <span className="text-gray-500 font-mono">
                  U$S {gastoGenero.mujeres.toLocaleString('es-UY')}
                  <span className="text-gray-300 ml-1">({totalGasto > 0 ? ((gastoGenero.mujeres / totalGasto) * 100).toFixed(1) : 0}%)</span>
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalGasto > 0 ? (gastoGenero.mujeres / totalGasto) * 100 : 0}%`, backgroundColor: '#173363' }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">Hombres</span>
                <span className="text-gray-500 font-mono">
                  U$S {gastoGenero.hombres.toLocaleString('es-UY')}
                  <span className="text-gray-300 ml-1">({totalGasto > 0 ? ((gastoGenero.hombres / totalGasto) * 100).toFixed(1) : 0}%)</span>
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalGasto > 0 ? (gastoGenero.hombres / totalGasto) * 100 : 0}%`, backgroundColor: '#0096D1' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
