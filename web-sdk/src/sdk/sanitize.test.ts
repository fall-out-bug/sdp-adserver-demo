/**
 * Sanitize Tests - HTML sanitization for security
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeAttributes,
  sanitizeScriptTags,
  sanitizeEventHandlers,
  sanitizeStyleAttribute,
  sanitizeHrefAttribute,
  sanitizeSrcAttribute,
  isSafeUrl,
  CSP_NONCE,
  setNonce,
  getNonce,
} from './sanitize.js';

describe('sanitizeHtml', () => {
  it('should allow safe HTML', () => {
    const safe = '<div><p>Hello <span>World</span></p></div>';
    const result = sanitizeHtml(safe);
    expect(result).toContain('<div>');
    expect(result).toContain('<p>');
    expect(result).toContain('Hello');
    expect(result).toContain('<span>');
    expect(result).toContain('World');
  });

  it('should remove script tags', () => {
    const withScript = '<div><script>alert("XSS")</script><p>Hello</p></div>';
    const result = sanitizeHtml(withScript);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>');
    expect(result).toContain('Hello');
  });

  it('should remove script tags with various cases', () => {
    const variants = [
      '<SCRIPT>alert("XSS")</SCRIPT>',
      '<Script>alert("XSS")</Script>',
      '<script type="text/javascript">alert(1)</script>',
      '<script language="javascript">alert(1)</script>',
      '<script src="evil.js"></script>',
    ];

    for (const html of variants) {
      const result = sanitizeHtml(html);
      expect(result.toLowerCase()).not.toContain('<script');
    }
  });

  it('should remove inline event handlers', () => {
    const withEvents = '<div onclick="alert(1)" onmouseover="evil()" onerror="alert(1)">Content</div>';
    const result = sanitizeHtml(withEvents);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('onmouseover');
    expect(result).not.toContain('onerror');
    expect(result).toContain('Content');
  });

  it('should remove dangerous attributes', () => {
    const dangerous = '<div data-x="javascript:alert(1)" style="color:red">Text</div>';
    const result = sanitizeHtml(dangerous);
    expect(result).toContain('Text');
    // style attribute should be preserved but sanitized
  });

  it('should handle empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('should handle null input', () => {
    expect(sanitizeHtml(null as unknown as string)).toBe('');
  });

  it('should handle undefined input', () => {
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve safe attributes', () => {
    const safe = '<a href="https://example.com" class="link" id="myLink">Link</a>';
    const result = sanitizeHtml(safe);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('class="link"');
    expect(result).toContain('id="myLink"');
  });

  it('should sanitize img tags', () => {
    const img = '<img src="https://example.com/image.jpg" alt="Image" onerror="alert(1)">';
    const result = sanitizeHtml(img);
    expect(result).toContain('<img');
    expect(result).toContain('src="https://example.com/image.jpg"');
    expect(result).toContain('alt="Image"');
    expect(result).not.toContain('onerror');
  });

  it('should handle iframes with sandbox', () => {
    const iframe = '<iframe src="https://example.com" sandbox="allow-scripts"></iframe>';
    const result = sanitizeHtml(iframe);
    expect(result).toContain('<iframe');
    expect(result).toContain('sandbox');
  });

  it('should handle SVG', () => {
    const svg = '<svg><circle cx="50" cy="50" r="40" fill="red" /></svg>';
    const result = sanitizeHtml(svg);
    expect(result).toContain('<svg');
    expect(result).toContain('circle');
  });
});

describe('sanitizeScriptTags', () => {
  it('should remove script tags', () => {
    const html = '<div><script>alert(1)</script><p>Content</p></div>';
    const result = sanitizeScriptTags(html);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('<p>Content</p>');
  });

  it('should handle multiple script tags', () => {
    const html = '<script>alert(1)</script><div>Content</div><script>alert(2)</script>';
    const result = sanitizeScriptTags(html);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert(1)');
    expect(result).not.toContain('alert(2)');
    expect(result).toContain('Content');
  });

  it('should handle script tags with attributes', () => {
    const html = '<script src="evil.js" type="text/javascript"></script>';
    const result = sanitizeScriptTags(html);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('evil.js');
  });

  it('should handle script-like tags', () => {
    const html = '<div><embed src="evil.swf"><applet code="evil.class"></div>';
    const result = sanitizeScriptTags(html);
    // Should not remove embed/applet by default (only script tags)
    expect(result).toContain('<embed');
    expect(result).toContain('<applet');
  });

  it('should handle empty string', () => {
    expect(sanitizeScriptTags('')).toBe('');
  });
});

describe('sanitizeEventHandlers', () => {
  it('should remove onclick', () => {
    const html = '<div onclick="alert(1)">Click</div>';
    const result = sanitizeEventHandlers(html);
    expect(result).not.toContain('onclick');
    expect(result).toContain('Click');
  });

  it('should remove all on* event handlers', () => {
    const events = [
      'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
      'onmousemove', 'onmouseout', 'onfocus', 'onblur', 'onkeydown',
      'onkeypress', 'onkeyup', 'onsubmit', 'onreset', 'onload',
      'onunload', 'onerror', 'onabort', 'onchange', 'onselect',
    ];

    for (const event of events) {
      const html = `<div ${event}="alert(1)">Content</div>`;
      const result = sanitizeEventHandlers(html);
      expect(result).not.toContain(event);
      expect(result).toContain('Content');
    }
  });

  it('should handle event handlers with mixed case', () => {
    const html = '<div onClick="alert(1)" OnMouseOver="evil()">Content</div>';
    const result = sanitizeEventHandlers(html);
    expect(result.toLowerCase()).not.toContain('onclick');
    expect(result.toLowerCase()).not.toContain('onmouseover');
  });

  it('should handle event handlers with various quote styles', () => {
    const variants = [
      '<div onclick="alert(1)">',
      "<div onclick='alert(1)'>",
      '<div onclick=alert(1)>',
    ];

    for (const html of variants) {
      const result = sanitizeEventHandlers(html);
      expect(result).not.toContain('onclick');
    }
  });
});

describe('sanitizeStyleAttribute', () => {
  it('should allow safe styles', () => {
    const style = 'color: red; font-size: 14px; background-color: blue;';
    const result = sanitizeStyleAttribute(style);
    expect(result).toContain('color');
    expect(result).toContain('font-size');
    expect(result).toContain('background-color');
  });

  it('should remove javascript: expression', () => {
    const dangerous = 'width: expression(alert(1));';
    const result = sanitizeStyleAttribute(dangerous);
    expect(result).not.toContain('expression');
  });

  it('should remove url() with dangerous protocols', () => {
    const dangerous = 'background: url(javascript:alert(1));';
    const result = sanitizeStyleAttribute(dangerous);
    expect(result).not.toContain('javascript:');
  });

  it('should allow url() with safe protocols', () => {
    const safe = 'background: url(https://example.com/image.png);';
    const result = sanitizeStyleAttribute(safe);
    expect(result).toContain('url(');
    expect(result).toContain('https://example.com');
  });

  it('should handle empty string', () => {
    expect(sanitizeStyleAttribute('')).toBe('');
  });

  it('should handle null input', () => {
    expect(sanitizeStyleAttribute(null as unknown as string)).toBe('');
  });
});

describe('sanitizeHrefAttribute', () => {
  it('should allow safe href', () => {
    const safe = 'https://example.com';
    const result = sanitizeHrefAttribute(safe);
    expect(result).toBe(safe);
  });

  it('should allow relative URLs', () => {
    const relative = '/path/to/page';
    const result = sanitizeHrefAttribute(relative);
    expect(result).toBe(relative);
  });

  it('should remove javascript: protocol', () => {
    const dangerous = 'javascript:alert(1)';
    const result = sanitizeHrefAttribute(dangerous);
    expect(result).toBe('#');
  });

  it('should remove data: protocol', () => {
    const dangerous = 'data:text/html,<script>alert(1)</script>';
    const result = sanitizeHrefAttribute(dangerous);
    expect(result).toBe('#');
  });

  it('should handle empty string', () => {
    expect(sanitizeHrefAttribute('')).toBe('');
  });

  it('should handle null input', () => {
    expect(sanitizeHrefAttribute(null as unknown as string)).toBe('');
  });
});

describe('sanitizeSrcAttribute', () => {
  it('should allow safe src', () => {
    const safe = 'https://example.com/image.jpg';
    const result = sanitizeSrcAttribute(safe);
    expect(result).toBe(safe);
  });

  it('should allow relative URLs', () => {
    const relative = '/images/logo.png';
    const result = sanitizeSrcAttribute(relative);
    expect(result).toBe(relative);
  });

  it('should remove dangerous protocols', () => {
    const dangerous = 'javascript:alert(1)';
    const result = sanitizeSrcAttribute(dangerous);
    expect(result).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeSrcAttribute('')).toBe('');
  });

  it('should handle null input', () => {
    expect(sanitizeSrcAttribute(null as unknown as string)).toBe('');
  });
});

describe('isSafeUrl', () => {
  it('should return true for safe URLs', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
    expect(isSafeUrl('/path/to/page')).toBe(true);
    expect(isSafeUrl('//example.com')).toBe(true);
  });

  it('should return false for dangerous URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
  });

  it('should handle empty string', () => {
    expect(isSafeUrl('')).toBe(false);
  });

  it('should handle null input', () => {
    expect(isSafeUrl(null as unknown as string)).toBe(false);
  });
});

describe('sanitizeAttributes', () => {
  it('should sanitize href attributes', () => {
    const html = '<a href="javascript:alert(1)">Link</a>';
    const result = sanitizeAttributes(html);
    expect(result).not.toContain('javascript:');
    expect(result).toContain('href="#"');
  });

  it('should sanitize src attributes', () => {
    const html = '<img src="javascript:alert(1)">';
    const result = sanitizeAttributes(html);
    expect(result).not.toContain('javascript:');
  });

  it('should preserve safe attributes', () => {
    const html = '<a href="https://example.com" class="link" id="myLink">Link</a>';
    const result = sanitizeAttributes(html);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('class="link"');
    expect(result).toContain('id="myLink"');
  });
});

describe('CSP Nonce', () => {
  beforeEach(() => {
    setNonce('');
  });

  it('should have default CSP_NONCE', () => {
    expect(CSP_NONCE).toBeDefined();
    expect(typeof CSP_NONCE).toBe('string');
  });

  it('should set and get nonce', () => {
    setNonce('test-nonce-123');
    expect(getNonce()).toBe('test-nonce-123');
  });

  it('should reset nonce', () => {
    setNonce('test-nonce-123');
    setNonce('');
    expect(getNonce()).toBe('');
  });

  it('should use nonce in sanitized HTML when set', () => {
    setNonce('my-nonce');
    const html = '<style>.test { color: red; }</style>';
    sanitizeHtml(html);
    // The nonce may be added to style/script tags for CSP compliance
  });
});

describe('Integration tests', () => {
  it('should handle complex XSS attempts', () => {
    const xss = [
      '<div onclick="alert(1)">Click</div>',
      '<img src=x onerror="alert(1)">',
      '<a href="javascript:alert(1)">Link</a>',
      '<script>alert(1)</script>',
      '<div style="width:expression(alert(1))">X</div>',
      '<svg onload="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
    ];

    for (const html of xss) {
      const result = sanitizeHtml(html);
      expect(result.toLowerCase()).not.toContain('javascript:');
      expect(result.toLowerCase()).not.toContain('onerror');
      expect(result.toLowerCase()).not.toContain('onclick');
      expect(result.toLowerCase()).not.toContain('onload');
      expect(result.toLowerCase()).not.toContain('<script');
    }
  });

  it('should preserve safe banner HTML', () => {
    const banner = `
      <div class="banner" style="width: 300px; height: 250px; background: #f0f0f0;">
        <a href="https://example.com/click">
          <img src="https://example.com/image.jpg" alt="Banner">
        </a>
      </div>
    `;

    const result = sanitizeHtml(banner);
    expect(result).toContain('class="banner"');
    expect(result).toContain('href="https://example.com/click"');
    expect(result).toContain('src="https://example.com/image.jpg"');
    expect(result).toContain('alt="Banner"');
  });
});
