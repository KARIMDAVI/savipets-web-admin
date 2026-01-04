// Feature flags for incremental rollout of chat changes
export const USE_NEW_CHAT_FILTERS = true;
export const USE_CHAT_SEND_GUARD = true;

/**
 * Chat Organization Feature Flag
 * 
 * Controls the new chat organization system with role-based filtering:
 * - Admin ↔ Sitter conversations
 * - Admin ↔ Owner conversations
 * - Sitter ↔ Owner conversations
 * 
 * Default: false (safe fallback - feature disabled by default)
 * Enable: Set VITE_CHAT_ORGANIZATION_ENABLED=true in environment
 */
export const CHAT_ORGANIZATION_ENABLED = 
  import.meta.env.VITE_CHAT_ORGANIZATION_ENABLED === 'true' || false;

