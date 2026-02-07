/**
 * iframe Injection
 */

import type { CachedBanner } from '../cache.js';

export interface IframeInjectionOptions {
  sandbox?: boolean;
  title?: string;
  className?: string;
  allowFullscreen?: boolean;
}

/**
 * Inject banner in iframe
 */
export function injectInIframe(
  container: HTMLElement,
  banner: CachedBanner,
  options: IframeInjectionOptions = {}
): Promise<HTMLIFrameElement> {
  return new Promise((resolve, reject) => {
    const {
      sandbox = true,
      title = 'Advertisement',
      className = 'adserver-banner-iframe',
      allowFullscreen = false,
    } = options;

    const iframe = document.createElement('iframe');
    iframe.className = className;
    iframe.title = title;
    iframe.width = banner.width.toString();
    iframe.height = banner.height.toString();
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';

    // Sandbox for security
    if (sandbox) {
      iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
    }

    if (allowFullscreen) {
      iframe.allowFullscreen = true;
    }

    // Handle load event
    iframe.onload = () => {
      try {
        injectContent(iframe, banner);
        resolve(iframe);
      } catch (error) {
        reject(error);
      }
    };

    // Handle error event
    iframe.onerror = () => {
      reject(new Error('Failed to load iframe'));
    };

    container.innerHTML = '';
    container.appendChild(iframe);
  });
}

/**
 * Inject content into iframe
 */
function injectContent(iframe: HTMLIFrameElement, banner: CachedBanner): void {
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    throw new Error('Cannot access iframe document');
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          a {
            text-decoration: none;
          }
          img {
            border: none;
            display: block;
            max-width: 100%;
          }
        </style>
      </head>
      <body>
        ${banner.html}
        <script>
          // Setup click tracking in iframe
          (function() {
            function handleClick(e) {
              var target = e.target;
              var link = target.closest('a');
              if (link) {
                e.preventDefault();
                window.parent.postMessage({
                  type: 'adserver-click',
                  url: '${banner.clickURL}',
                  referrer: window.location.href
                }, '*');
              }
            }
            document.body.addEventListener('click', handleClick);
          })();
        </script>
      </body>
    </html>
  `);
  doc.close();
}

/**
 * Setup message listener for iframe communication
 */
export function setupIframeMessageListener(callback: (data: { type: string; url?: string; referrer?: string }) => void): () => void {
  const listener = (event: MessageEvent) => {
    // Validate origin (in production, check specific origins)
    if (event.origin !== window.location.origin && !event.origin.includes('localhost')) {
      return;
    }

    if (event.data && event.data.type === 'adserver-click') {
      callback(event.data);
    }
  };

  window.addEventListener('message', listener);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', listener);
  };
}

/**
 * Create responsive iframe that adapts to container size
 */
export function createResponsiveIframe(
  container: HTMLElement,
  banner: CachedBanner,
  options: IframeInjectionOptions = {}
): Promise<HTMLIFrameElement> {
  return injectInIframe(container, banner, options).then((iframe) => {
    // Setup resize observer for responsive behavior
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            iframe.style.width = `${width}px`;
            iframe.style.height = `${height}px`;
          }
        }
      });

      resizeObserver.observe(container);

      // Return cleanup function
      iframe.addEventListener('load', () => {
        // Store cleanup function on iframe element
        (iframe as any)._resizeObserver = resizeObserver;
      });
    }

    return iframe;
  });
}

/**
 * Cleanup iframe resources
 */
export function cleanupIframe(iframe: HTMLIFrameElement): void {
  // Stop resize observer if exists
  const resizeObserver = (iframe as any)._resizeObserver;
  if (resizeObserver) {
    resizeObserver.disconnect();
    delete (iframe as any)._resizeObserver;
  }

  // Remove iframe from DOM
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}
