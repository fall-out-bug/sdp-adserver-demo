/**
 * Render - Banner rendering engine with auto-detect size
 */

import { getCachedBanner, setCachedBanner, type CachedBanner } from './cache.js';
import { fetchBannerCached, createDeliveryRequest } from './client.js';
import { sanitizeHtml } from './sanitize.js';

export interface RenderOptions {
  width?: number;
  height?: number;
  referer?: string;
  useIframe?: boolean;
  fallbackEnabled?: boolean;
}

export interface RenderResult {
  success: boolean;
  method: 'direct' | 'iframe' | 'fallback' | 'cache';
  banner?: CachedBanner;
  error?: Error;
}

/**
 * Detect container size using ResizeObserver or getBoundingClientRect
 */
export function detectContainerSize(element: HTMLElement): { width: number; height: number } {
  // Try direct measurement first
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }

  // Fallback to CSS computed styles
  const styles = window.getComputedStyle(element);
  const width = parseInt(styles.width, 10);
  const height = parseInt(styles.height, 10);

  if (width > 0 && height > 0) {
    return { width, height };
  }

  // Default size
  return { width: 300, height: 250 };
}

/**
 * Render banner to container
 */
export async function renderBanner(
  slotID: string,
  container: HTMLElement,
  options: RenderOptions = {}
): Promise<RenderResult> {
  try {
    // Check cache first
    const cached = getCachedBanner(slotID);
    if (cached) {
      return await injectBanner(container, cached, options, 'cache');
    }

    // Fetch from API
    const request = createDeliveryRequest(slotID, {
      width: options.width,
      height: options.height,
      referer: options.referer,
    });

    const banner = await fetchBannerCached(request);

    // Cache the banner
    setCachedBanner(slotID, banner);

    // Inject banner
    return await injectBanner(container, banner, options);
  } catch (error) {
    // Handle error with fallback
    if (options.fallbackEnabled !== false) {
      return renderFallback(container, error as Error);
    }

    return {
      success: false,
      method: 'fallback',
      error: error as Error,
    };
  }
}

/**
 * Inject banner into container
 */
async function injectBanner(
  container: HTMLElement,
  banner: CachedBanner,
  options: RenderOptions,
  sourceMethod: 'direct' | 'iframe' | 'cache' = 'direct'
): Promise<RenderResult> {
  const injectionMethod = options.useIframe ? 'iframe' : 'direct';

  if (options.useIframe) {
    await injectInIframe(container, banner);
  } else {
    injectDirect(container, banner);
  }

  // Track impression
  trackImpression(banner.impression);

  return {
    success: true,
    method: sourceMethod === 'cache' ? 'cache' : injectionMethod,
    banner,
  };
}

/**
 * Inject banner directly into container
 */
function injectDirect(container: HTMLElement, banner: CachedBanner): void {
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
}

/**
 * Inject banner in iframe
 */
async function injectInIframe(
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
      resolve();
    };

    container.innerHTML = '';
    container.appendChild(iframe);
  });
}

/**
 * Render fallback banner
 */
function renderFallback(container: HTMLElement, error: Error): RenderResult {
  const fallbackHTML = `
    <div class="adserver-fallback" style="
      width: 300px;
      height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      border: 1px dashed #ccc;
      text-align: center;
      padding: 20px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #666;
    ">
      <div>
        <p>Advertisement</p>
        <p style="font-size: 12px; color: #999;">Temporarily unavailable</p>
      </div>
    </div>
  `;

  container.innerHTML = fallbackHTML;

  return {
    success: true,
    method: 'fallback',
  };
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
    } else {
      // Track click on non-link elements
      const img = target.closest('img');
      if (img) {
        event.preventDefault();
        const fullUrl = new URL(clickURL);
        fullUrl.searchParams.set('referrer', window.location.href);
        window.open(fullUrl.toString(), '_blank');
      }
    }
  });
}

/**
 * Track impression
 */
function trackImpression(impressionURL: string): void {
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
 * Auto-render banner when element with data-slot-id appears
 */
export function autoRender(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          const slot = node.querySelector('[data-slot-id]') || (
            node.hasAttribute && node.hasAttribute('data-slot-id') ? node : null
          );

          if (slot) {
            const slotID = slot.getAttribute('data-slot-id');
            if (slotID) {
              renderBanner(slotID, slot as HTMLElement).catch((error) => {
                console.error(`[AdServerSDK] Failed to auto-render slot ${slotID}:`, error);
              });
            }
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
