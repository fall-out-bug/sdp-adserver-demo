/**
 * Sanitize HTML Style - Style attribute sanitization
 */

import { isString } from './sanitize-html-base.js';
import { isSafeUrl } from './sanitize-url.js';

/**
 * Dangerous CSS properties and values
 */
const DANGEROUS_CSS_PATTERNS = [
  /expression\s*\(/i,
  /javascript\s*:/i,
  /behavior\s*:/i,
];

/**
 * Sanitize style attribute
 */
export function sanitizeStyleAttribute(style: unknown): string {
  if (!isString(style)) {
    return '';
  }

  let sanitized = style;

  // Remove dangerous CSS patterns
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Remove url() with dangerous protocols
  sanitized = sanitized.replace(/url\s*\(\s*['"]?([^)'"]+)['"]?\s*\)/gi, (match, url) => {
    if (!isSafeUrl(url)) {
      return 'url(about:blank)';
    }
    return match;
  });

  return sanitized.trim();
}

/**
 * Sanitize attributes in HTML
 */
export function sanitizeAttributes(html: string): string {
  // Sanitize href attributes
  let sanitized = html.replace(
    /href\s*=\s*(['"]?)(javascript:|data:|vbscript:)[^'">]*\1/gi,
    'href="#"'
  );

  // Sanitize src attributes
  sanitized = sanitized.replace(
    /src\s*=\s*(['"]?)(javascript:|data:|vbscript:)[^'">]*\1/gi,
    ''
  );

  // Sanitize style attributes
  sanitized = sanitized.replace(
    /style\s*=\s*(['"])([^'"]*)\1/gi,
    (_match, quote, style) => {
      const sanitizedStyle = sanitizeStyleAttribute(style);
      if (sanitizedStyle) {
        return `style=${quote}${sanitizedStyle}${quote}`;
      }
      return '';
    }
  );

  return sanitized;
}
