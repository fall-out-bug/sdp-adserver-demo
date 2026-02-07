import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getFallbackHTML,
  renderFallback,
  createFallbackElement,
  showPSA,
} from './fallback.js';

describe('Fallback', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('getFallbackHTML', () => {
    it('should return default fallback HTML', () => {
      const html = getFallbackHTML();
      expect(html).toContain('adserver-fallback');
      expect(html).toContain('Temporarily unavailable');
    });

    it('should use custom HTML if provided', () => {
      const customHTML = '<div>Custom Fallback</div>';
      const html = getFallbackHTML({ html: customHTML });
      expect(html).toBe(customHTML);
    });

    it('should use custom text if provided', () => {
      const html = getFallbackHTML({ text: 'No ads available' });
      expect(html).toContain('No ads available');
      expect(html).not.toContain('Temporarily unavailable');
    });

    it('should use custom colors', () => {
      const html = getFallbackHTML({
        backgroundColor: '#ff0000',
        borderColor: '#00ff00',
        textColor: '#0000ff',
      });
      expect(html).toContain('#ff0000');
      expect(html).toContain('#00ff00');
      expect(html).toContain('#0000ff');
    });
  });

  describe('renderFallback', () => {
    it('should render fallback to container', () => {
      renderFallback(container);
      expect(container.innerHTML).toContain('adserver-fallback');
    });

    it('should use custom config', () => {
      renderFallback(container, { text: 'Custom message' });
      expect(container.innerHTML).toContain('Custom message');
    });
  });

  describe('createFallbackElement', () => {
    it('should create fallback element with specified size', () => {
      const element = createFallbackElement(300, 250);
      expect(element.style.width).toBe('300px');
      expect(element.style.height).toBe('250px');
      expect(element.innerHTML).toContain('adserver-fallback');
    });

    it('should use custom config', () => {
      const element = createFallbackElement(200, 200, {
        text: 'Test',
        backgroundColor: '#ccc',
      });
      expect(element.style.width).toBe('200px');
      expect(element.innerHTML).toContain('Test');
    });
  });

  describe('showPSA', () => {
    it('should render PSA fallback', () => {
      showPSA(container);
      expect(container.innerHTML).toContain('adserver-psa');
      expect(container.innerHTML).toContain('Support Independent Publishing');
    });

    it('should include custom message', () => {
      showPSA(container, 'Support local journalism');
      expect(container.innerHTML).toContain('Support local journalism');
    });
  });
});
