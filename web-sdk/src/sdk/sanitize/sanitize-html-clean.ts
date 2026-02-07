/**
 * Sanitize HTML Clean - HTML cleaning functions
 */

import { EVENT_HANDLERS } from './sanitize-html-base.js';

/**
 * Remove event handlers from HTML
 */
export function sanitizeEventHandlers(html: string): string {
  let sanitized = html;

  // Remove all on* event handlers
  for (const handler of EVENT_HANDLERS) {
    // Match event handlers with single quotes
    const regexSingle = new RegExp(`\\s${handler}\\s*=\\s*'[^']*'`, 'gi');
    sanitized = sanitized.replace(regexSingle, '');

    // Match event handlers with double quotes
    const regexDouble = new RegExp(`\\s${handler}\\s*=\\s*"[^"]*"`, 'gi');
    sanitized = sanitized.replace(regexDouble, '');

    // Match event handlers without quotes
    const regexNone = new RegExp(`\\s${handler}\\s*=\\s*[^\\s>]*`, 'gi');
    sanitized = sanitized.replace(regexNone, '');
  }

  return sanitized;
}

/**
 * Remove script tags from HTML
 */
export function sanitizeScriptTags(html: string): string {
  // Remove script tags with any content
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  return html.replace(scriptRegex, '');
}
