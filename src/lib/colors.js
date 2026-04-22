/**
 * Color tokens for Dashboard Publicidad Política Uruguay 2024
 * Single source of truth for all colors
 * Referenced in CLAUDE.md: Paleta de colores (no modificar sin consultar)
 */

export const COLORS = {
  // UCU Branding
  UCU_DARK: '#173363',      // Header, footer, títulos
  UCU_MED: '#1e3d72',       // Secundario
  ACENTO_CELESTE: '#0096D1', // Botón activo, pills, links

  // Backgrounds & Neutrals
  FONDO_GRIS: '#F9FAFB',    // Background secciones alternas
  BLANCO: '#FFFFFF',
  GRIS_400: '#9CA3AF',
  GRIS_600: '#4B5563',
  GRIS_700: '#374151',

  // Tipos de Anuncio (Multi-etiqueta)
  TIPO_PROMOCION: '#6366F1',   // Advocacy
  TIPO_CTA: '#3B82F6',         // Call-to-action
  TIPO_TEMA: '#10B981',        // Issue
  TIPO_IMAGEN: '#F59E0B',      // Image
  TIPO_CEREMONIAL: '#8B5CF6',  // Ceremonial
  TIPO_ATAQUE: '#EF4444',      // Attack

  // Partidos Políticos (gráficos Home)
  PARTIDO_NACIONAL: '#0EA5E9',    // Sky blue
  FRENTE_AMPLIO: '#EAB308',       // Amber/Yellow
  PARTIDO_COLORADO: '#EF4444',    // Red
  OTROS: '#6B7280',               // Gray

  // Legacy D3 colors (kept for compatibility during PageTipos migration)
  LEGACY_ADVOCACY: '#1b9e77',
  LEGACY_CTA: '#7570b3',
  LEGACY_ISSUE: '#e6ab02',
  LEGACY_IMAGE: '#66a61e',
  LEGACY_CEREMONIAL: '#e7298a',
  LEGACY_ATTACK: '#d95f02',
}

// Convenience maps for color lookups
export const TIPO_COLORS = {
  advocacy: COLORS.TIPO_PROMOCION,
  cta: COLORS.TIPO_CTA,
  issue: COLORS.TIPO_TEMA,
  image: COLORS.TIPO_IMAGEN,
  ceremonial: COLORS.TIPO_CEREMONIAL,
  attack: COLORS.TIPO_ATAQUE,
}

export const PARTIDO_COLORS = {
  'Partido Nacional': COLORS.PARTIDO_NACIONAL,
  'Frente Amplio': COLORS.FRENTE_AMPLIO,
  'Partido Colorado': COLORS.PARTIDO_COLORADO,
  'Otros': COLORS.OTROS,
}

/**
 * Get color for a classification type (key)
 */
export function getTipoColor(tipoKey) {
  return TIPO_COLORS[tipoKey] || COLORS.GRIS_400
}

/**
 * Get color for a political party
 */
export function getPartidoColor(partidoName) {
  return PARTIDO_COLORS[partidoName] || COLORS.OTROS
}
