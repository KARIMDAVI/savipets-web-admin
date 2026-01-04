export type CanonicalConversationType =
  | 'admin-inquiry'
  | 'client-sitter'
  | 'sitter-to-client';

export type RawConversationType = CanonicalConversationType | 'adminInquiry' | string | undefined | null;

export const ADMIN_INQUIRY_TYPE: CanonicalConversationType = 'admin-inquiry';
export const CLIENT_SITTER_TYPE: CanonicalConversationType = 'client-sitter';
export const SITTER_TO_CLIENT_TYPE: CanonicalConversationType = 'sitter-to-client';

// Include legacy/raw values we know about for tolerant Firestore queries
export const ADMIN_INQUIRY_ALL_VALUES: readonly string[] = [
  ADMIN_INQUIRY_TYPE,
  'adminInquiry',
];

export function normalizeConversationType(raw: RawConversationType): CanonicalConversationType | undefined {
  if (!raw) return undefined;
  const value = String(raw);

  // Legacy / alternate spellings mapping
  if (value === 'adminInquiry' || value === 'admin-inquiry') {
    return ADMIN_INQUIRY_TYPE;
  }

  if (value === 'client-sitter') {
    return CLIENT_SITTER_TYPE;
  }

  if (value === 'sitter-to-client') {
    return SITTER_TO_CLIENT_TYPE;
  }

  // If an unknown value is stored, keep it out of the canonical union
  return undefined;
}


