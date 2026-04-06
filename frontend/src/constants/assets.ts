/**
 * Asset path constants for CraftAgent UI.
 * All images are located in /frontend/public/assets/
 */

export const AGENT_AVATARS = {
  NEXUS: "/assets/agents/nexus.png",
  ALEX: "/assets/agents/alex.png",
  VORTEX: "/assets/agents/vortex.png",
  RESEARCHER: "/assets/agents/researcher.png",
} as const;

export const UI_ICONS = {
  UPLOAD: "/assets/icons/upload.png",
  SETTINGS: "/assets/icons/settings.png",
  CHAT: "/assets/icons/chat.png",
  FILE: "/assets/icons/file.png",
  DELETE: "/assets/icons/delete.png",
} as const;

export const STATUS_INDICATORS = {
  ONLINE: "/assets/status/online.png",
  OFFLINE: "/assets/status/offline.png",
  BUSY: "/assets/status/busy.png",
} as const;

export const CATEGORY_BADGES = {
  KNOWLEDGE: "/assets/categories/knowledge.png",
  UTILITY: "/assets/categories/utility.png",
  ANALYSIS: "/assets/categories/analysis.png",
  CREATION: "/assets/categories/creation.png",
} as const;

/**
 * Get agent avatar by name
 */
export function getAgentAvatar(agentName: string): string {
  const normalized = agentName.toUpperCase();
  return AGENT_AVATARS[normalized as keyof typeof AGENT_AVATARS] || AGENT_AVATARS.NEXUS;
}

/**
 * Get status indicator by status
 */
export function getStatusIndicator(status: "online" | "offline" | "busy"): string {
  return STATUS_INDICATORS[status.toUpperCase() as keyof typeof STATUS_INDICATORS];
}

/**
 * Get category badge by category name
 */
export function getCategoryBadge(category: string): string {
  const normalized = category.toUpperCase();
  return CATEGORY_BADGES[normalized as keyof typeof CATEGORY_BADGES] || CATEGORY_BADGES.KNOWLEDGE;
}
