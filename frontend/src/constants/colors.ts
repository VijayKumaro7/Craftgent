/**
 * Color palette constants for CraftAgent UI.
 * Minecraft-inspired color scheme with agent-specific colors.
 */

export const AGENT_COLORS = {
  NEXUS: {
    primary: "#1E90FF",      // Bright blue
    secondary: "#64C8FF",    // Light blue
    dark: "#0052CC",         // Dark blue
  },
  ALEX: {
    primary: "#228B22",      // Forest green
    secondary: "#90EE90",    // Light green
    dark: "#0D5D0D",         // Dark green
  },
  VORTEX: {
    primary: "#8A2BE2",      // Blue violet
    secondary: "#C864FF",    // Light purple
    dark: "#4A0080",         // Dark purple
  },
  RESEARCHER: {
    primary: "#FF8C00",      // Dark orange
    secondary: "#FFC864",    // Light orange
    dark: "#CC6600",         // Dark orange
  },
} as const;

export const STATUS_COLORS = {
  online: "#32CD32",         // Lime green
  offline: "#808080",        // Gray
  busy: "#DC143C",           // Crimson red
  idle: "#FFD700",           // Gold
} as const;

export const UI_COLORS = {
  success: "#50C878",        // Emerald green
  warning: "#FFA500",        // Orange
  error: "#FF4444",          // Red
  info: "#4169E1",           // Royal blue
  background: "#000000",
  surface: "#1A1A1A",
  border: "#404040",
  text: "#E8E8E8",
  textMuted: "#808080",
} as const;

export const CATEGORY_COLORS = {
  knowledge: "#4169E1",      // Royal blue
  utility: "#228B22",        // Forest green
  analysis: "#8A2BE2",       // Blue violet
  creation: "#FF8C00",       // Dark orange
} as const;

/**
 * Get agent color by agent name
 */
export function getAgentColor(agentName: string) {
  const normalized = agentName.toUpperCase();
  const agentColor = AGENT_COLORS[normalized as keyof typeof AGENT_COLORS];
  return agentColor || AGENT_COLORS.NEXUS;
}

/**
 * Get category color by category name
 */
export function getCategoryColor(category: string): string {
  const normalized = category.toLowerCase();
  return CATEGORY_COLORS[normalized as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.knowledge;
}
