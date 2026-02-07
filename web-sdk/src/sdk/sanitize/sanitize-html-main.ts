/**
 * Sanitize HTML Main - Main HTML sanitization function
 */

import { isString } from './sanitize-html-base.js';
import { sanitizeScriptTags } from './sanitize-html-clean.js';
import { sanitizeEventHandlers } from './sanitize-html-clean.js';
import { sanitizeAttributes } from './sanitize-html-style.js';
import { getNonce } from './sanitize-url.js';

/**
 * Comprehensive HTML sanitization
 * - Removes script tags
 * - Removes event handlers
 * - Sanitizes dangerous attributes
 * - Preserves safe HTML
 */
export function sanitizeHtml(html: unknown, nonce: string = ''): string {
  if (!isString(html)) {
    return '';
  }

  if (html.length === 0) {
    return '';
  }

  let sanitized = html;

  // Remove script tags first (multiple times to catch nested patterns)
  for (let i = 0; i < 3; i++) {
    sanitized = sanitizeScriptTags(sanitized);
  }

  // Remove event handlers
  sanitized = sanitizeEventHandlers(sanitized);

  // Sanitize attributes
  sanitized = sanitizeAttributes(sanitized);

  // Add nonce to style and script tags if nonce is set
  const currentNonce = nonce || getNonce();
  if (currentNonce) {
    sanitized = sanitized.replace(
      /<(style|script)\b/gi,
      `<$1 nonce="${currentNonce}"`
    );
  }

  return sanitized;
}

/**
 * Sanitize banner HTML for injection
 * This is a specialized function for ad banner content
 */
export function sanitizeBannerHtml(bannerHtml: string, nonce: string = ''): string {
  return sanitizeHtml(bannerHtml, nonce);
}
