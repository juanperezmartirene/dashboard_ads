import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ExternalLink, X, Calendar, MapPin, DollarSign, Eye, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const PARTY_COLORS = {
  'Partido Nacional': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Frente Amplio':    { bg: '#FEE2E2', color: '#DC2626' },
  'Partido Colorado': { bg: '#FEF3C7', color: '#D97706' },
  'Otros':            { bg: '#F3F4F6', color: '#6B7280' },
}

const TYPE_BADGE = {
  video:  { bg: '#EFF6FF', color: '#3B82F6', label: 'Video' },
  imagen: { bg: '#FEF3C7', color: '#D97706', label: 'Imagen' },
}

const PARTIDOS = ['Todos', 'Frente Amplio', 'Partido Nacional', 'Partido Colorado', 'Otros']
const TIPOS    = ['Todos', 'video', 'imagen']

const COLS = [
  { key: 'page_name',             label: 'Página',      sortable: true,  width: 'max-w-[160px]' },
  { key: 'part_org',              label: 'Partido',      sortable: true  },
  { key: 'text_body',             label: 'Texto',        sortable: false, width: 'max-w-[240px]' },
  { key: 'tipo',                  label: 'Tipo',         sortable: true  },
  { key: 'departamento_nacional', label: 'Alcance',      sortable: true  },
  { key: 'etapa',                 label: 'Etapa',        sortable: true  },
  { key: 'promedio_gasto',        label: 'Gasto',        sortable: true  },
  { key: 'promedio_impresiones',  label: 'Impresiones',  sortable: true  },
  { key: '_link',                 label: '',             sortable: false },
]

const PAGE_SIZE = 20

// ── Modal de detalle del anuncio ──────────────────────────────────────────────

function AdModal({ row, onClose }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!row) return null

  const texto = row.text_body || row.texto_anuncio_completo || '—'
  const partyColor = PARTY_COLORS[row.part_org] || PARTY_COLORS['Otros']
  const metaUrl = `https://www.facebook.com/ads/library/?id=${row.id}`
  const fechas = [row.ad_delivery_start_time, row.ad_delivery_stop_time].filter(Boolean).join(' → ')

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="bg-white rounded-sm shadow-xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-semibold text-gray-800 truncate">{row.page_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: partyColor.bg, color: partyColor.color }}
              >
                {row.part_org}
              </span>
              {row.tipo && TYPE_BADGE[row.tipo] && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: TYPE_BADGE[row.tipo].bg, color: TYPE_BADGE[row.tipo].color }}
                >
                  {TYPE_BADGE[row.tipo].label}
                </span>
              )}
              {row.etapa && (
                <span className="text-xs text-gray-400">{row.etapa}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1"><DollarSign className="size-3" /> Gasto est.</p>
            <p className="text-sm font-mono font-semibold text-gray-800 mt-0.5">
              U$S {Math.round(row.promedio_gasto || 0).toLocaleString('es-UY')}
            </p>
            {(row.spend_lower != null || row.spend_upper != null) && (
              <p className="text-xs text-gray-400 mt-0.5">
                Rango: ${row.spend_lower ?? '?'}–${row.spend_upper ?? '?'}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1"><Eye className="size-3" /> Impresiones</p>
            <p className="text-sm font-mono font-semibold text-gray-800 mt-0.5">
              {Math.round(row.promedio_impresiones || 0).toLocaleString('es-UY')}
            </p>
            {(row.impressions_low != null || row.impressions_upp != null) && (
              <p className="text-xs text-gray-400 mt-0.5">
                Rango: {row.impressions_low?.toLocaleString('es-UY') ?? '?'}–{row.impressions_upp?.toLocaleString('es-UY') ?? '?'}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="size-3" /> Alcance</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{row.departamento_nacional || 'Nacional'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="size-3" /> Período</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{fechas || row.fecha || '—'}</p>
          </div>
        </div>

        {/* Texto del anuncio */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <FileText className="size-3" /> Texto del anuncio
          </p>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
            {texto}
          </p>
        </div>

        {/* Metadatos adicionales */}
        <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {row.pre_pres && (
            <div>
              <span className="text-gray-400">Precandidato/candidato:</span>{' '}
              <span className="text-gray-700 font-medium">{row.pre_pres}</span>
            </div>
          )}
          {row.lista_sector_candidato && (
            <div>
              <span className="text-gray-400">Lista/sector:</span>{' '}
              <span className="text-gray-700 font-medium">{row.lista_sector_candidato}</span>
            </div>
          )}
          {row.publisher_platforms && (
            <div>
              <span className="text-gray-400">Plataformas:</span>{' '}
              <span className="text-gray-700 font-medium">
                {String(row.publisher_platforms).replace(/[\[\]']/g, '').replace(/,/g, ', ')}
              </span>
            </div>
          )}
          {row.id && (
            <div>
              <span className="text-gray-400">ID anuncio:</span>{' '}
              <span className="text-gray-700 font-mono">{row.id}</span>
            </div>
          )}
        </div>

        {/* Botón a Meta Ad Library */}
        <div className="px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Datos de Meta Ad Library · {row.fecha || '—'}
          </p>
          <a
            href={metaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#0096D1' }}
          >
            <ExternalLink className="size-4" />
            Ver en Biblioteca de Anuncios
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Tabla principal ───────────────────────────────────────────────────────────

export default function DataTable({ data }) {
  const [sort,       setSort]       = useState({ key: 'promedio_gasto', dir: 'desc' })
  const [search,     setSearch]     = useState('')
  const [partido,    setPartido]    = useState('Todos')
  const [tipoFilter, setTipoFilter] = useState('Todos')
  const [page,       setPage]       = useState(0)
  const [selected,   setSelected]   = useState(null)

  const filtered = useMemo(() => {
    let rows = [...data]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        (r.page_name || '').toLowerCase().includes(q) ||
        (r.text_body || r.texto_anuncio_completo || '').toLowerCase().includes(q) ||
        (r.part_org || '').toLowerCase().includes(q) ||
        (r.pre_pres || '').toLowerCase().includes(q)
      )
    }

    if (partido !== 'Todos') {
      rows = rows.filter(r => r.part_org === partido || r.part_org_normalized === partido)
    }

    if (tipoFilter !== 'Todos') {
      rows = rows.filter(r => r.tipo === tipoFilter)
    }

    if (sort.key) {
      rows.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'es')
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }

    return rows
  }, [data, search, partido, tipoFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages - 1)
  const paged      = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const handleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
    setPage(0)
  }

  const handleSearch  = (val) => { setSearch(val); setPage(0) }
  const handlePartido = (val) => { setPartido(val); setPage(0) }
  const handleTipo    = (val) => { setTipoFilter(val); setPage(0) }

  const reset = () => {
    setSearch(''); setPartido('Todos'); setTipoFilter('Todos')
    setSort({ key: 'promedio_gasto', dir: 'desc' }); setPage(0)
  }

  const hasFilters = search.trim() || partido !== 'Todos' || tipoFilter !== 'Todos'

  return (
    <div>
      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Buscar por página, partido, candidato o texto..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="max-w-xs text-sm"
        />
        <Select value={partido} onValueChange={handlePartido}>
          <SelectTrigger className="w-[180px] text-sm">
            <SelectValue placeholder="Partido" />
          </SelectTrigger>
          <SelectContent>
            {PARTIDOS.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={handleTipo}>
          <SelectTrigger className="w-[130px] text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map(t => (
              <SelectItem key={t} value={t}>{t === 'Todos' ? 'Todos los tipos' : t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={reset} className="text-xs">
            Limpiar filtros
          </Button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length.toLocaleString('es-UY')} registros
        </span>
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {COLS.map(col => (
                <TableHead
                  key={col.key}
                  className={cn('text-xs font-semibold uppercase tracking-wide whitespace-nowrap', col.width)}
                  style={{ color: '#173363' }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                    >
                      {col.label}
                      <span className="text-gray-300 text-xs">
                        {sort.key === col.key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS.length} className="text-center text-sm text-gray-400 py-10">
                  Sin resultados para los filtros actuales.
                </TableCell>
              </TableRow>
            ) : paged.map(row => {
              const partyC = PARTY_COLORS[row.part_org] || PARTY_COLORS['Otros']
              return (
                <TableRow
                  key={row.id}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  onClick={() => setSelected(row)}
                >
                  {/* Página */}
                  <TableCell className="text-sm font-medium text-gray-700 max-w-[160px]">
                    <span className="block truncate">{row.page_name || '—'}</span>
                  </TableCell>

                  {/* Partido */}
                  <TableCell>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap"
                      style={{ backgroundColor: partyC.bg, color: partyC.color }}
                    >
                      {row.part_org || '—'}
                    </span>
                  </TableCell>

                  {/* Texto */}
                  <TableCell className="text-sm text-gray-500 max-w-[240px]">
                    <span
                      className="block truncate"
                      title={row.text_body || row.texto_anuncio_completo}
                    >
                      {row.text_body || row.texto_anuncio_completo || '—'}
                    </span>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    {row.tipo && TYPE_BADGE[row.tipo] ? (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: TYPE_BADGE[row.tipo].bg, color: TYPE_BADGE[row.tipo].color }}
                      >
                        {TYPE_BADGE[row.tipo].label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </TableCell>

                  {/* Alcance */}
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                    {row.departamento_nacional || '—'}
                  </TableCell>

                  {/* Etapa */}
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                    {row.etapa || '—'}
                  </TableCell>

                  {/* Gasto */}
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap font-mono text-right">
                    {row.promedio_gasto > 0
                      ? `$${Math.round(row.promedio_gasto).toLocaleString('es-UY')}`
                      : '—'}
                  </TableCell>

                  {/* Impresiones */}
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap font-mono text-right">
                    {row.promedio_impresiones > 0
                      ? Math.round(row.promedio_impresiones).toLocaleString('es-UY')
                      : '—'}
                  </TableCell>

                  {/* Link externo */}
                  <TableCell className="text-center px-2">
                    {row.id ? (
                      <a
                        href={`https://www.facebook.com/ads/library/?id=${row.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                        title="Ver en Biblioteca de Anuncios de Meta"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Paginación ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 text-xs text-gray-500">
        <span>
          Mostrando {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de {filtered.length.toLocaleString('es-UY')}
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="outline" size="sm"
            className="text-xs h-7 px-2"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            ← Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter(i => Math.abs(i - safePage) <= 2)
            .map(i => (
              <Button
                key={i}
                variant={i === safePage ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7 w-7 p-0"
                style={i === safePage ? { backgroundColor: '#0096D1', borderColor: '#0096D1' } : {}}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            ))}
          <Button
            variant="outline" size="sm"
            className="text-xs h-7 px-2"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
          >
            Siguiente →
          </Button>
        </div>
      </div>

      {/* ── Modal de detalle ── */}
      <AdModal row={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
