/**
 * VytalYou Nurse App — Color palette.
 * Shares the same brand DNA as the Customer App but uses a
 * teal/emerald accent to visually distinguish the staff experience.
 */
export const colors = {
  // ── Brand backgrounds & surfaces ──────────────────────────────
  backgroundNavy: '#0e253d',
  backgroundDark: '#0a1726',
  backgroundBlack: '#0c0c0c',
  backgroundWhite: '#ffffff',
  backgroundCard: 'rgba(255, 255, 255, 0.06)',
  backgroundCardHover: 'rgba(255, 255, 255, 0.10)',

  // ── Brand accents ─────────────────────────────────────────────
  accentAqua: '#7fffd4',       // shared hero accent
  accentTeal: '#2dd4bf',       // nurse-specific primary action
  accentCyan: '#4dd6ff',       // info / links
  accentOrange: '#ee7f1a',     // alerts & warnings
  accentYellow: '#f5d042',     // pending states
  accentRed: '#ff5e5e',        // reject / error
  accentGreen: '#34d399',      // accept / success

  // ── Text ──────────────────────────────────────────────────────
  textPrimary: '#ffffff',
  textMuted: '#ced4da',
  textSecondary: '#6c757d',
  textDark: '#212529',

  // ── Utility ───────────────────────────────────────────────────
  borderSubtle: '#495057',
  borderFocus: 'rgba(45, 212, 191, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shimmer: 'rgba(127, 255, 212, 0.08)',
} as const;

export type ColorName = keyof typeof colors;
