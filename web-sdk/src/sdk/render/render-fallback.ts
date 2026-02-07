/**
 * Render Fallback - Fallback rendering
 */

import type { RenderResult } from './index.js';

/**
 * Render fallback banner
 */
export function renderFallback(container: HTMLElement, _error: Error): RenderResult {
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
