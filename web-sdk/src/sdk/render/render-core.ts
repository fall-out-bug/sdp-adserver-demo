/**
 * Render Core - Core render functionality
 */

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
 * Setup click tracking for direct injection
 */
export function setupClickTracking(wrapper: HTMLElement, clickURL: string): void {
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
