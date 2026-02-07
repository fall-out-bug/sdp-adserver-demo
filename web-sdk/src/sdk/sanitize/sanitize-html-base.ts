/**
 * Sanitize HTML Base - Base types and utilities for HTML sanitization
 */

/**
 * Event handler attributes to remove
 */
export const EVENT_HANDLERS = [
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
export const SAFE_TAGS = new Set([
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
export const SAFE_ATTRIBUTES = new Set([
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
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
