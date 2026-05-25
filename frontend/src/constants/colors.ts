/**
 * Color palette constants for dark and light themes
 * Used for dynamic theme switching and color references throughout the app
 */

export const DARK_COLORS = {
  // Backgrounds
  bg: {
    primary: '#09090e',
    secondary: '#12121a',
    card: 'rgba(18,18,26,0.85)',
    elevated: '#1a1a27',
  },
  // Accents
  accent: {
    primary: '#7c3aed',
    hover: '#8b5cf6',
    secondary: '#a78bfa',
    bright: '#8b5cf6',
  },
  // Text
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#64748b',
    accent: '#a78bfa',
  },
  // Borders
  border: {
    subtle: 'rgba(124,58,237,0.08)',
    default: 'rgba(124,58,237,0.15)',
    strong: 'rgba(124,58,237,0.3)',
  },
  // Status
  success: '#059669',
  warning: '#f97316',
  error: '#dc2626',
  // Agent colors
  agent: {
    nexus: '#7c3aed',
    alex: '#059669',
    vortex: '#a78bfa',
    researcher: '#f97316',
  },
} as const;

export const LIGHT_COLORS = {
  // Backgrounds
  bg: {
    primary: '#fafbfc',
    secondary: '#f1f5f9',
    card: 'rgba(241,245,249,0.9)',
    elevated: '#ffffff',
  },
  // Accents
  accent: {
    primary: '#7c3aed',
    hover: '#8b5cf6',
    secondary: '#a78bfa',
    bright: '#8b5cf6',
  },
  // Text
  text: {
    primary: '#09090e',
    secondary: '#475569',
    muted: '#94a3b8',
    accent: '#7c3aed',
  },
  // Borders
  border: {
    subtle: 'rgba(124,58,237,0.1)',
    default: 'rgba(124,58,237,0.2)',
    strong: 'rgba(124,58,237,0.4)',
  },
  // Status
  success: '#059669',
  warning: '#f97316',
  error: '#dc2626',
  // Agent colors
  agent: {
    nexus: '#7c3aed',
    alex: '#059669',
    vortex: '#a78bfa',
    researcher: '#f97316',
  },
} as const;

export type ThemeType = 'dark' | 'light';
export type ColorScheme = typeof DARK_COLORS;

export const getColorScheme = (theme: ThemeType): ColorScheme => {
  return theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
};

export const AGENT_NAMES = {
  nexus: 'NEXUS',
  alex: 'ALEX',
  vortex: 'VORTEX',
  researcher: 'RESEARCHER',
} as const;

export const AGENT_COLORS = DARK_COLORS.agent;

export const getAgentColor = (agent: string, theme: ThemeType = 'dark'): string => {
  const scheme = getColorScheme(theme);
  const lowerAgent = agent.toLowerCase();
  return scheme.agent[lowerAgent as keyof typeof scheme.agent] || scheme.accent.primary;
};
