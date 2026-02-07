/**
 * Sanitize - HTML sanitization for security and CSP compliance
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
 * Dangerous CSS properties and values
 */
const DANGEROUS_CSS_PATTERNS = [
  /expression\s*\(/i,
  /javascript\s*:/i,
  /behavior\s*:/i,
];

/**
 * Event handler attributes to remove
 */
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

/**
 * Safe HTML tags (whitelist)
 */
const SAFE_TAGS = new Set([
  'a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio',
  'b', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',
  'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
  'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
  'em', 'embed',
  'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
  'i', 'iframe', 'img', 'input', 'ins',
  'kbd',
  'label', 'legend', 'li', 'link',
  'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter',
  'nav', 'noscript',
  'object', 'ol', 'optgroup', 'option', 'output',
  'p', 'param', 'picture', 'pre', 'progress',
  'q',
  'rp', 'rt', 'ruby',
  's', 'samp', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
  'u', 'ul',
  'var', 'video',
  'wbr',
]);

/**
 * Safe attributes (whitelist)
 */
const SAFE_ATTRIBUTES = new Set([
  'abbr', 'accept', 'accept-charset', 'accesskey', 'action', 'align', 'alt', 'async',
  'autocomplete', 'autofocus', 'autoplay', 'autosave',
  'background', 'bgcolor', 'border', 'buffered',
  'challenge', 'charset', 'checked', 'cite', 'class', 'code', 'codebase', 'color',
  'cols', 'colspan', 'content', 'contenteditable', 'contextmenu', 'controls', 'coords',
  'data', 'datetime', 'default', 'defer', 'dir', 'dirname', 'disabled', 'download',
  'draggable', 'dropzone', 'enctype',
  'for', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
  'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'hreflang', 'http-equiv',
  'icon', 'id', 'ismap', 'itemprop',
  'keytype',
  'kind', 'label', 'lang', 'language', 'list', 'loop', 'low',
  'manifest', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'muted',
  'name', 'novalidate',
  'open', 'optimum',
  'pattern', 'ping', 'placeholder', 'poster', 'preload', 'pubdate',
  'radiogroup', 'readonly', 'rel', 'required', 'reversed', 'rows', 'rowspan',
  'sandbox', 'scope', 'scoped', 'seamless', 'selected', 'shape', 'size', 'sizes', 'span',
  'spellcheck', 'src', 'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style', 'summary',
  'tabindex', 'target', 'title', 'type',
  'usemap',
  'value',
  'width', 'wmode',
  'wrap',
]);

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

/**
 * Comprehensive HTML sanitization
 * - Removes script tags
 * - Removes event handlers
 * - Sanitizes dangerous attributes
 * - Preserves safe HTML
 */
export function sanitizeHtml(html: unknown): string {
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
  if (currentNonce) {
    sanitized = sanitized.replace(
      /<(style|script)\b/gi,
      `<$1 nonce="${currentNonce}"`
    );
  }

  return sanitized;
}

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
 * Sanitize banner HTML for injection
 * This is a specialized function for ad banner content
 */
export function sanitizeBannerHtml(bannerHtml: string): string {
  return sanitizeHtml(bannerHtml);
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
