/**
 * Sanitize HTML Build - HTML building and element creation
 */

import { isString } from './sanitize-html-base.js';
import { SAFE_TAGS, SAFE_ATTRIBUTES } from './sanitize-html-base.js';
import { sanitizeHtml } from './sanitize-html-main.js';
import { sanitizeStyleAttribute } from './sanitize-html-style.js';
import { sanitizeHrefAttribute, sanitizeSrcAttribute } from './sanitize-url.js';

/**
 * Create a safe HTML element with sanitized content
 */
export function createSafeElement(
  tagName: string,
  attributes: Record<string, string> = {},
  content: string = ''
): string {
  // Validate tag name
  if (!SAFE_TAGS.has(tagName.toLowerCase())) {
    return '';
  }

  let html = `<${tagName}`;

  // Add safe attributes
  for (const [key, value] of Object.entries(attributes)) {
    if (SAFE_ATTRIBUTES.has(key.toLowerCase())) {
      let sanitizedValue = value;

      // Special handling for specific attributes
      if (key.toLowerCase() === 'href') {
        sanitizedValue = sanitizeHrefAttribute(value);
      } else if (key.toLowerCase() === 'src') {
        sanitizedValue = sanitizeSrcAttribute(value);
      } else if (key.toLowerCase() === 'style') {
        sanitizedValue = sanitizeStyleAttribute(value);
      }

      if (sanitizedValue) {
        html += ` ${key}="${sanitizedValue}"`;
      }
    }
  }

  html += '>';

  // Add sanitized content
  if (content) {
    html += sanitizeHtml(content);
  }

  // Close tag (for non-void elements)
  const voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  if (!voidElements.has(tagName.toLowerCase())) {
    html += `</${tagName}>`;
  }

  return html;
}

/**
 * Check if HTML is safe (no XSS detected)
 */
export function isSafeHtml(html: unknown): boolean {
  if (!isString(html)) {
    return false;
  }

  // Check for script tags
  if (/<script\b/i.test(html)) {
    return false;
  }

  // Check for event handlers
  const EVENT_HANDLERS = [
    'onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate',
    'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus',
    'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate',
    'onblur', 'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu',
    'oncontrolselect', 'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged',
    'ondatasetcomplete', 'ondblclick', 'ondeactivate', 'ondrag', 'ondragend',
    'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onerror',
    'onerrorupdate', 'onfilterchange', 'onfinish', 'onfocus', 'onfocusin', 'onfocusout',
    'onhelp', 'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload',
    'onlosecapture', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove',
    'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onmove', 'onmoveend',
    'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange', 'onreset',
    'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete',
    'onrowsinserted', 'onscroll', 'onselect', 'onselectionchange', 'onselectstart',
    'onstart', 'onstop', 'onsubmit', 'onunload',
  ];

  for (const handler of EVENT_HANDLERS) {
    if (new RegExp(`\\s${handler}\\s*=`, 'i').test(html)) {
      return false;
    }
  }

  // Check for dangerous protocols
  if (/(href|src|action)\s*=\s*['"]?(javascript:|data:)/i.test(html)) {
    return false;
  }

  return true;
}
