/**
 * Render Inject - Banner injection methods
 */

import type { CachedBanner } from '../cache.js';
import { sanitizeHtml } from '../sanitize/index.js';
import { setupClickTracking, trackImpression } from './render-core.js';

/**
 * Inject banner directly into container
 */
export function injectDirect(container: HTMLElement, banner: CachedBanner): void {
  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.className = 'adserver-banner';
  wrapper.style.width = `${banner.width}px`;
  wrapper.style.height = `${banner.height}px`;
  wrapper.style.display = 'inline-block';
  wrapper.style.position = 'relative';

  // Inject HTML (sanitized for XSS prevention)
  wrapper.innerHTML = sanitizeHtml(banner.html);

  // Setup click tracking
  setupClickTracking(wrapper, banner.clickURL);

  // Clear container and append
  container.innerHTML = '';
  container.appendChild(wrapper);

  // Track impression
  trackImpression(banner.impression);
}

/**
 * Inject banner in iframe
 */
export async function injectInIframe(
  container: HTMLElement,
  banner: CachedBanner
): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.className = 'adserver-banner-iframe';
    iframe.width = banner.width.toString();
    iframe.height = banner.height.toString();
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';

    // Sandbox for security
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';

    iframe.onload = () => {
      // Inject content into iframe
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        const parentOrigin = window.location.origin;
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; }
                a { text-decoration: none; }
                img { border: none; }
              </style>
            </head>
            <body>
              ${sanitizeHtml(banner.html)}
              <script>
                // Setup click tracking in iframe
                (function() {
                  const parentOrigin = "${parentOrigin}";
                  document.body.addEventListener('click', function(e) {
                    const target = e.target.closest('a');
                    if (target) {
                      e.preventDefault();
                      window.parent.postMessage({
                        type: 'adserver-click',
                        url: '${banner.clickURL}'
                      }, parentOrigin);
                    }
                  });
                })();
              </script>
            </body>
          </html>
        `);
        doc.close();
      }

      // Track impression
      trackImpression(banner.impression);

      resolve();
    };

    container.innerHTML = '';
    container.appendChild(iframe);
  });
}
