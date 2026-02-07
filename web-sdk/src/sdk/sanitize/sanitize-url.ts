/**
 * Sanitize URL - URL sanitization for security
 */

/**
 * Current CSP nonce value
 */
let currentNonce: string = '';

/**
 * Get current CSP nonce
 */
export function getNonce(): string {
  return currentNonce;
}

/**
 * Set CSP nonce
 */
export function setNonce(nonce: string): void {
  currentNonce = nonce;
}

/**
 * CSP nonce constant (read-only accessor)
 */
export const CSP_NONCE = currentNonce;

/**
 * Dangerous URL protocols
 */
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'chrome-extension:',
  'moz-extension:',
];

/**
 * Check if value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if URL is safe
 */
export function isSafeUrl(url: unknown): boolean {
  if (!isString(url) || url.length === 0) {
    return false;
  }

  const trimmed = url.trim().toLowerCase();

  // Check for dangerous protocols
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(protocol.toLowerCase())) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize href attribute
 */
export function sanitizeHrefAttribute(href: unknown): string {
  if (!isString(href)) {
    return '';
  }

  const trimmed = href.trim();

  if (trimmed.length === 0) {
    return '';
  }

  if (!isSafeUrl(trimmed)) {
    return '#';
  }

  return trimmed;
}

/**
 * Sanitize src attribute
 */
export function sanitizeSrcAttribute(src: unknown): string {
  if (!isString(src)) {
    return '';
  }

  const trimmed = src.trim();

  if (trimmed.length === 0) {
    return '';
  }

  if (!isSafeUrl(trimmed)) {
    return '';
  }

  return trimmed;
}
