/**
 * Fallback - Fallback banner handler
 */

export interface FallbackConfig {
  enabled?: boolean;
  html?: string;
  text?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

/**
 * Get fallback HTML
 */
export function getFallbackHTML(config: FallbackConfig = {}): string {
  if (config.html) {
    return config.html;
  }

  const bg = config.backgroundColor || '#f5f5f5';
  const border = config.borderColor || '#ccc';
  const text = config.textColor || '#666';
  const message = config.text || 'Temporarily unavailable';

  return `
    <div class="adserver-fallback" style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${bg};
      border: 1px dashed ${border};
      text-align: center;
      padding: 20px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: ${text};
    ">
      <div>
        <p style="margin: 0; font-weight: bold;">Advertisement</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">${message}</p>
      </div>
    </div>
  `;
}

/**
 * Render fallback to container
 */
export function renderFallback(container: HTMLElement, config: FallbackConfig = {}): void {
  const html = getFallbackHTML(config);
  container.innerHTML = html;
}

/**
 * Create fallback element
 */
export function createFallbackElement(width: number, height: number, config: FallbackConfig = {}): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.innerHTML = getFallbackHTML(config);
  return wrapper;
}

/**
 * Show PSA (Public Service Announcement) fallback
 */
export function showPSA(container: HTMLElement, message?: string): void {
  const psaHTML = `
    <div class="adserver-psa" style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      text-align: center;
      padding: 20px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: white;
    ">
      <div>
        <p style="margin: 0; font-size: 16px; font-weight: bold;">Support Independent Publishing</p>
        ${message ? `<p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">${message}</p>` : ''}
      </div>
    </div>
  `;

  container.innerHTML = psaHTML;
}
