import { useState, useMemo } from 'react'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_COLORS = {
  'Promoción':  { bg: '#EEF2FF', color: '#6366F1' },
  'Ataque':     { bg: '#FEF2F2', color: '#EF4444' },
  'CTA':        { bg: '#EFF6FF', color: '#3B82F6' },
  'Tema':       { bg: '#ECFDF5', color: '#10B981' },
  'Imagen':     { bg: '#FFFBEB', color: '#F59E0B' },
  'Ceremonial': { bg: '#F5F3FF', color: '#8B5CF6' },
}

const PARTIDOS = ['Todos', 'Frente Amplio', 'Partido Nacional', 'Partido Colorado', 'Otros']

const COLS = [
  { key: 'page_name',             label: 'Nombre de página', sortable: true  },
  { key: 'part_org',              label: 'Partido',          sortable: true  },
  { key: 'text_body',             label: 'Texto',            sortable: false },
  { key: 'departamento_nacional', label: 'Alcance',          sortable: true  },
  { key: '_gasto',                label: 'Gasto Est.',       sortable: false },
  { key: '_impresiones',          label: 'Impresiones',      sortable: true  },
  { key: '_link',                 label: 'Ver',              sortable: false },
]

const PAGE_SIZE = 20

export default function DataTable({ data }) {
  const [sort,    setSort]    = useState({ key: null, dir: 'asc' })
  const [search,  setSearch]  = useState('')
  const [partido, setPartido] = useState('Todos')
  const [page,    setPage]    = useState(0)

  const filtered = useMemo(() => {
    let rows = [...data]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        (r.page_name  || '').toLowerCase().includes(q) ||
        (r.text_body  || r.texto_anuncio_completo || '').toLowerCase().includes(q) ||
        (r.part_org   || '').toLowerCase().includes(q)
      )
    }

    if (partido !== 'Todos') {
      rows = rows.filter(r => r.part_org === partido || r.part_org_normalized === partido)
    }

    if (sort.key) {
      rows.sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'es')
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }

    return rows
  }, [data, search, partido, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages - 1)
  const paged      = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const handleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
    setPage(0)
  }

  const handleSearch = (val) => { setSearch(val); setPage(0) }
  const handlePartido = (val) => { setPartido(val); setPage(0) }

  const reset = () => { setSearch(''); setPartido('Todos'); setSort({ key: null, dir: 'asc' }); setPage(0) }

  const hasFilters = search.trim() || partido !== 'Todos'

  return (
    <div>
      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Buscar por página, partido o texto..."
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
                  className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
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
            ) : paged.map(row => (
              <TableRow key={row.id} className="hover:bg-gray-50/70">

                {/* Nombre de página */}
                <TableCell className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {row.page_name || '—'}
                </TableCell>

                {/* Partido */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                  {row.part_org || '—'}
                </TableCell>

                {/* Texto — truncado con tooltip nativo */}
                <TableCell className="text-sm text-gray-500 max-w-[220px]">
                  <span
                    className="block truncate"
                    title={row.text_body || row.texto_anuncio_completo}
                  >
                    {row.text_body || row.texto_anuncio_completo || '—'}
                  </span>
                </TableCell>

                {/* Alcance */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                  {row.departamento_nacional || '—'}
                </TableCell>

                {/* Gasto */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap font-mono">
                  {row._gasto || '—'}
                </TableCell>

                {/* Impresiones */}
                <TableCell className="text-sm text-gray-600 whitespace-nowrap font-mono text-right">
                  {typeof row._impresiones === 'number'
                    ? row._impresiones.toLocaleString('es-UY')
                    : row._impresiones || '—'}
                </TableCell>

                {/* Link a Biblioteca de Transparencia de Meta */}
                <TableCell className="text-center">
                  {row.id ? (
                    <a
                      href={`https://www.facebook.com/ads/library/?id=${row.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-sm transition-colors hover:bg-blue-50"
                      style={{ color: '#0096D1' }}
                      title="Ver en Biblioteca de Anuncios de Meta"
                    >
                      <ExternalLink className="size-3.5" />
                      <span className="hidden sm:inline">Meta</span>
                    </a>
                  ) : '—'}
                </TableCell>

              </TableRow>
            ))}
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
    </div>
  )
}
