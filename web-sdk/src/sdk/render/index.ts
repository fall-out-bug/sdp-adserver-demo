/**
 * Render - Banner rendering engine with auto-detect size
 */

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
  banner?: any;
  error?: Error;
}

export {
  detectContainerSize,
  setupClickTracking,
  trackImpression,
} from './render-core.js';

export {
  injectDirect,
  injectInIframe,
} from './render-inject.js';

export {
  renderFallback,
} from './render-fallback.js';

// Re-import for use in renderBanner
import { getCachedBanner, setCachedBanner, type CachedBanner } from '../cache.js';
import { fetchBannerCached, createDeliveryRequest } from '../client.js';
import { detectContainerSize } from './render-core.js';
import { injectDirect, injectInIframe } from './render-inject.js';
import { renderFallback } from './render-fallback.js';

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

  return {
    success: true,
    method: sourceMethod === 'cache' ? 'cache' : injectionMethod,
    banner,
  };
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

// Re-export types
export type { CachedBanner } from '../cache.js';
