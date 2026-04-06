import { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { ExternalLink, X, Calendar, MapPin, DollarSign, Eye, FileText, Tag, Maximize2, Image, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClickOutside } from '@/hooks/use-click-outside'

const SPRING = { type: 'spring', bounce: 0.1, duration: 0.4 }

const PARTY_COLORS = {
  'Partido Nacional': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Frente Amplio':    { bg: '#FEE2E2', color: '#DC2626' },
  'Partido Colorado': { bg: '#FEF3C7', color: '#D97706' },
  'Otros':            { bg: '#F3F4F6', color: '#6B7280' },
}

const TIPOLOGIA_LABELS = {
  advocacy:       { label: 'Promoción',  color: '#6366F1' },
  attack:         { label: 'Ataque',     color: '#EF4444' },
  image:          { label: 'Imagen',     color: '#F59E0B' },
  issue:          { label: 'Tema',       color: '#10B981' },
  call_to_action: { label: 'CTA',        color: '#3B82F6' },
  ceremonial:     { label: 'Ceremonial', color: '#8B5CF6' },
}

const ETAPA_BADGE = {
  Internas:   { bg: '#EFF6FF', color: '#3B82F6' },
  Nacionales: { bg: '#FEF3C7', color: '#D97706' },
  Ballottage: { bg: '#F3E8FF', color: '#7C3AED' },
}

function getTipologias(row) {
  return Object.entries(TIPOLOGIA_LABELS)
    .filter(([key]) => row[key] === 1 || row[key] === '1')
    .map(([key, val]) => ({ key, ...val }))
}

const PARTIDOS = ['Todos', 'Frente Amplio', 'Partido Nacional', 'Partido Colorado', 'Otros']
const ETAPAS   = ['Todas', 'Internas', 'Nacionales', 'Ballottage']

const COLS = [
  { key: 'page_name',             label: 'Página',          sortable: true,  width: 'w-56 min-w-[14rem]' },
  { key: 'part_org',              label: 'Partido',         sortable: true,  width: 'w-28 min-w-[7rem]'  },
  { key: 'etapa',                 label: 'Tipo elección',   sortable: true  },
  { key: 'departamento_nacional', label: 'Alcance',         sortable: true  },
  { key: '_tipologia',            label: 'Clasificación',   sortable: false },
  { key: '_expand',               label: '',                sortable: false },
]

const PAGE_SIZE = 20

// ── Morphing Ad Detail Dialog ─────────────────────────────────────────────────

function useAdMedia(adId) {
  const [media, setMedia] = useState({ type: null, loading: true })

  useEffect(() => {
    if (!adId) { setMedia({ type: null, loading: false }); return }
    let cancelled = false

    async function detect() {
      // Check image first
      try {
        const imgRes = await fetch(`/media/images/elecciones_2024/${adId}_imagen.jpg`, { method: 'HEAD' })
        const imgType = imgRes.headers.get('Content-Type') || ''
        if (!cancelled && imgRes.ok && imgType.startsWith('image/')) {
          setMedia({ type: 'image', src: `/media/images/elecciones_2024/${adId}_imagen.jpg`, loading: false })
          return
        }
      } catch {}

      // Check video
      try {
        const vidRes = await fetch(`/media/videos/elecciones_2024/${adId}_video.mp4`, { method: 'HEAD' })
        const vidType = vidRes.headers.get('Content-Type') || ''
        if (!cancelled && vidRes.ok && vidType.startsWith('video/')) {
          setMedia({
            type: 'video',
            src: `/media/videos/elecciones_2024/${adId}_video.mp4`,
            poster: `/media/videos/elecciones_2024/${adId}_portada.jpg`,
            loading: false,
          })
          return
        }
      } catch {}

      if (!cancelled) setMedia({ type: null, loading: false })
    }

    detect()
    return () => { cancelled = true }
  }, [adId])

  return media
}

function AdDetail({ row, layoutId, onClose }) {
  const ref = useRef(null)
  useClickOutside(ref, onClose)

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const texto      = row.text_body || row.texto_anuncio_completo || '—'
  const partyColor = PARTY_COLORS[row.part_org] || PARTY_COLORS['Otros']
  const etapaBadge = ETAPA_BADGE[row.etapa]
  const metaUrl    = `https://www.facebook.com/ads/library/?id=${row.id}`
  const fechas     = [row.ad_delivery_start_time, row.ad_delivery_stop_time].filter(Boolean).join(' → ')
  const tipologias = getTipologias(row)
  const media      = useAdMedia(row.id)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Morphing card — shares layoutId with the trigger button */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pointer-events-none">
        <motion.div
          ref={ref}
          layoutId={layoutId}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle del anuncio de ${row.page_name}`}
          className="bg-white rounded-sm shadow-xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto pointer-events-auto"
          style={{ borderRadius: 6 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex-1 min-w-0 mr-4">
              <motion.p
                className="text-sm font-semibold text-gray-800 truncate"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {row.page_name}
              </motion.p>
              <motion.div
                className="flex items-center gap-2 mt-1 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: partyColor.bg, color: partyColor.color }}
                >
                  {row.part_org}
                </span>
                {row.etapa && etapaBadge && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: etapaBadge.bg, color: etapaBadge.color }}
                  >
                    {row.etapa}
                  </span>
                )}
                {row.etapa && !etapaBadge && (
                  <span className="text-xs text-gray-400">{row.etapa}</span>
                )}
              </motion.div>
            </div>
            <motion.button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <X className="size-5" />
            </motion.button>
          </div>

          {/* Métricas */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
          >
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <DollarSign className="size-3" /> Gasto est.
              </p>
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
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Eye className="size-3" /> Impresiones
              </p>
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
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="size-3" /> Alcance
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {row.departamento_nacional || 'Nacional'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="size-3" /> Período
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {fechas || row._fecha || row.fecha || '—'}
              </p>
            </div>
          </motion.div>

          {/* Media (imagen o video) */}
          {!media.loading && media.type && (
            <motion.div
              className="px-6 py-4 border-b border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                {media.type === 'video' ? <Play className="size-3" /> : <Image className="size-3" />}
                {media.type === 'video' ? 'Video del anuncio' : 'Imagen del anuncio'}
              </p>
              {media.type === 'image' ? (
                <img
                  src={media.src}
                  alt={`Anuncio ${row.id}`}
                  className="w-full max-h-80 object-contain rounded bg-gray-50"
                />
              ) : (
                <video
                  src={media.src}
                  poster={media.poster}
                  controls
                  className="w-full max-h-80 rounded bg-black"
                  preload="metadata"
                />
              )}
            </motion.div>
          )}

          {/* Clasificación */}
          <motion.div
            className="px-6 py-3 border-b border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Tag className="size-3" /> Clasificación (ROUBERTa)
            </p>
            {tipologias.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tipologias.map(t => (
                  <span
                    key={t.key}
                    className="text-xs font-medium px-2.5 py-1 rounded"
                    style={{ backgroundColor: t.color + '18', color: t.color }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-300 italic">Sin clasificación disponible</p>
            )}
          </motion.div>

          {/* Texto */}
          <motion.div
            className="px-6 py-4 border-b border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <FileText className="size-3" /> Texto del anuncio
            </p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
              {texto}
            </p>
          </motion.div>

          {/* Metadatos */}
          <motion.div
            className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-x-6 gap-y-2 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.27 }}
          >
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
            {row.etapa && (
              <div>
                <span className="text-gray-400">Tipo de elección:</span>{' '}
                <span className="text-gray-700 font-medium">{row.etapa}</span>
              </div>
            )}
            {row.id != null && (
              <div>
                <span className="text-gray-400">ID anuncio:</span>{' '}
                <span className="text-gray-700 font-mono">{row.id}</span>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            className="px-6 py-4 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-gray-400">
              Meta Ad Library · {row._fecha || row.fecha || '—'}
            </p>
            <a
              href={metaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0096D1' }}
            >
              <ExternalLink className="size-4" />
              Ver en Biblioteca de Anuncios
            </a>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

// ── Tabla principal ───────────────────────────────────────────────────────────

export default function DataTable({ data }) {
  const [sort,        setSort]        = useState({ key: 'page_name', dir: 'asc' })
  const [search,      setSearch]      = useState('')
  const [partido,     setPartido]     = useState('Todos')
  const [etapaFilter, setEtapaFilter] = useState('Todas')
  const [page,        setPage]        = useState(0)
  const [selected,    setSelected]    = useState(null)  // { row, layoutId }

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

    if (etapaFilter !== 'Todas') {
      rows = rows.filter(r => r.etapa === etapaFilter)
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
  }, [data, search, partido, etapaFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages - 1)
  const paged      = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const handleSort    = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
    setPage(0)
  }
  const handleSearch  = (val) => { setSearch(val); setPage(0) }
  const handlePartido = (val) => { setPartido(val); setPage(0) }
  const handleEtapa   = (val) => { setEtapaFilter(val); setPage(0) }

  const reset = () => {
    setSearch(''); setPartido('Todos'); setEtapaFilter('Todas')
    setSort({ key: 'page_name', dir: 'asc' }); setPage(0)
  }

  const hasFilters = search.trim() || partido !== 'Todos' || etapaFilter !== 'Todas'

  const openDetail = (row) => {
    console.log('openDetail called for row:', row.id, row.page_name)
    setSelected({ row, layoutId: `ad-expand-${row.id}` })
  }
  const closeDetail = () => setSelected(null)

  return (
    <TooltipProvider delay={400}>
    <MotionConfig transition={SPRING}>
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
          <Select value={etapaFilter} onValueChange={handleEtapa}>
            <SelectTrigger className="w-[160px] text-sm">
              <SelectValue placeholder="Tipo elección" />
            </SelectTrigger>
            <SelectContent>
              {ETAPAS.map(e => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
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
                const partyC    = PARTY_COLORS[row.part_org] || PARTY_COLORS['Otros']
                const etapaBdg  = ETAPA_BADGE[row.etapa]
                const tipologias = getTipologias(row)
                const layoutId  = `ad-expand-${row.id}`
                const isOpen    = selected?.row?.id === row.id

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isOpen ? 'bg-blue-50/60' : 'hover:bg-blue-50/40'
                    )}
                    onClick={() => openDetail(row)}
                  >
                    {/* Página */}
                    <TableCell className="text-sm font-medium text-gray-700 w-[160px] max-w-0 overflow-hidden">
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

                    {/* Tipo de elección */}
                    <TableCell>
                      {row.etapa && etapaBdg ? (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap"
                          style={{ backgroundColor: etapaBdg.bg, color: etapaBdg.color }}
                        >
                          {row.etapa}
                        </span>
                      ) : row.etapa ? (
                        <span className="text-xs text-gray-500">{row.etapa}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </TableCell>

                    {/* Alcance */}
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                      {row.departamento_nacional || '—'}
                    </TableCell>

                    {/* Clasificación */}
                    <TableCell className="max-w-[180px]">
                      {tipologias.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tipologias.slice(0, 2).map(t => (
                            <span
                              key={t.key}
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
                              style={{ backgroundColor: t.color + '18', color: t.color }}
                            >
                              {t.label}
                            </span>
                          ))}
                          {tipologias.length > 2 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-[10px] text-gray-400 cursor-default">+{tipologias.length - 2}</span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <div className="flex flex-wrap gap-1">
                                  {tipologias.slice(2).map(t => (
                                    <span
                                      key={t.key}
                                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                      style={{ backgroundColor: t.color + '18', color: t.color }}
                                    >
                                      {t.label}
                                    </span>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </TableCell>

                    {/* Botón expand — trigger del morphing */}
                    <TableCell className="text-center px-2">
                      <motion.div
                        layoutId={layoutId}
                        className={cn(
                          'inline-flex items-center justify-center rounded p-1',
                          isOpen ? 'text-blue-500' : 'text-gray-400'
                        )}
                        style={{ borderRadius: 6 }}
                      >
                        <Maximize2 className="size-3.5" />
                      </motion.div>
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
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Anterior"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className={cn('text-xs', safePage === 0 && 'pointer-events-none opacity-40')}
                />
              </PaginationItem>
              {(() => {
                const pages = []
                for (let i = 0; i < totalPages; i++) pages.push(i)
                const visible = pages.filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1)
                return visible.map((i, idx, arr) => (
                  <Fragment key={i}>
                    {idx > 0 && arr[idx - 1] < i - 1 && (
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        isActive={i === safePage}
                        onClick={() => setPage(i)}
                        className="text-xs"
                        style={i === safePage ? { backgroundColor: '#0096D1', borderColor: '#0096D1', color: '#fff' } : {}}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  </Fragment>
                ))
              })()}
              <PaginationItem>
                <PaginationNext
                  text="Siguiente"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  className={cn('text-xs', safePage === totalPages - 1 && 'pointer-events-none opacity-40')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* ── Morphing Detail Dialog ── */}
        <AnimatePresence>
          {selected && (
            <AdDetail
              key={selected.layoutId}
              row={selected.row}
              layoutId={selected.layoutId}
              onClose={closeDetail}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
    </TooltipProvider>
  )
}
