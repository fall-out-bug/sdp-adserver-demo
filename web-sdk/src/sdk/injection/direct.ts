/**
 * Direct HTML Injection
 */

import { sanitizeHtml } from '../sanitize.js';
import type { CachedBanner } from '../cache.js';

export interface DirectInjectionOptions {
  wrapperClass?: string;
  wrapperStyle?: string;
  enableClickTracking?: boolean;
}

/**
 * Inject banner HTML directly into container
 */
export function injectDirect(
  container: HTMLElement,
  banner: CachedBanner,
  options: DirectInjectionOptions = {}
): void {
  const {
    wrapperClass = 'adserver-banner',
    wrapperStyle = '',
    enableClickTracking = true,
  } = options;

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.className = wrapperClass;
  wrapper.style.cssText = `
    width: ${banner.width}px;
    height: ${banner.height}px;
    display: inline-block;
    position: relative;
    ${wrapperStyle}
  `;

  // Inject HTML (sanitized for XSS prevention)
  wrapper.innerHTML = sanitizeHtml(banner.html);

  // Setup click tracking
  if (enableClickTracking) {
    setupClickTracking(wrapper, banner.clickURL);
  }

  // Clear container and append
  container.innerHTML = '';
  container.appendChild(wrapper);
}

/**
 * Setup click tracking for direct injection
 */
function setupClickTracking(wrapper: HTMLElement, clickURL: string): void {
  wrapper.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    // Check if clicked element is a link or inside a link
    const link = target.closest('a');
    if (link) {
      event.preventDefault();

      // Open click URL in new window
      const fullUrl = new URL(clickURL);
      fullUrl.searchParams.set('referrer', window.location.href);
      window.open(fullUrl.toString(), '_blank');
      return;
    }

    // Track click on non-link elements (images, etc)
    const img = target.closest('img');
    if (img) {
      event.preventDefault();
      const fullUrl = new URL(clickURL);
      fullUrl.searchParams.set('referrer', window.location.href);
      window.open(fullUrl.toString(), '_blank');
    }
  });
}

/**
 * Track impression
 */
export function trackImpression(impressionURL: string): void {
  if (!impressionURL) return;

  // Use navigator.sendBeacon for better performance
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon(impressionURL);
  } else {
    // Fallback to fetch
    fetch(impressionURL, { mode: 'no-cors', keepalive: true }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Style isolation for direct injection (simple version)
 * For production, consider using Shadow DOM
 */
export function applyStyleIsolation(wrapper: HTMLElement): void {
  // Add scoping class
  const scopeId = `adserver-${Math.random().toString(36).substr(2, 9)}`;
  wrapper.classList.add(scopeId);

  // Scope all descendant elements
  const elements = wrapper.querySelectorAll('*');
  elements.forEach(el => {
    el.classList.add(`${scopeId}__${el.tagName.toLowerCase()}`);
  });
}
