/**
 * Debug Overlay UI - Debug overlay UI component
 */

import type { DebugConfig, DebugOverlay } from './debug-types.js';

/**
 * DebugOverlayUI class for visual debugging capabilities
 */
export class DebugOverlayUI {
  private _config: Required<DebugConfig>;
  private _overlay: DebugOverlay = { visible: false, data: {} };
  private _highlightedElements: WeakMap<Element, string> = new WeakMap();

  constructor(config: Required<DebugConfig>) {
    this._config = config;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<DebugConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Show debug overlay
   */
  showOverlay(): boolean {
    if (!this._config.enabled || !this._config.enableOverlay) {
      return false;
    }
    this._overlay.visible = true;
    this._updateOverlayElement();
    return true;
  }

  /**
   * Hide debug overlay
   */
  hideOverlay(): void {
    this._overlay.visible = false;
    this._removeOverlayElement();
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay(): void {
    if (this._overlay.visible) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  /**
   * Check if overlay is visible
   */
  isOverlayVisible(): boolean {
    return this._overlay.visible;
  }

  /**
   * Update overlay data
   */
  updateOverlay(data: Record<string, unknown>): void {
    this._overlay.data = { ...this._overlay.data, ...data };
    if (this._overlay.visible) {
      this._updateOverlayElement();
    }
  }

  /**
   * Get overlay state
   */
  getOverlayState(): DebugOverlay {
    return { ...this._overlay };
  }

  /**
   * Highlight element visually for debugging
   */
  highlightElement(element: Element, color: string): void {
    if (!this._config.enabled) return;

    element.classList.add('ads-debug-highlight');
    (element as HTMLElement).style.outline = `2px solid ${color}`;
    this._highlightedElements.set(element, color);
  }

  /**
   * Remove highlight from element
   */
  unhighlightElement(element: Element): void {
    element.classList.remove('ads-debug-highlight');
    (element as HTMLElement).style.outline = '';
    this._highlightedElements.delete(element);
  }

  /**
   * Create debug border around element
   */
  debugBorder(
    element: Element,
    options: { color?: string; width?: string; style?: 'solid' | 'dashed' | 'dotted' } = {}
  ): void {
    if (!this._config.enabled) return;

    const {
      color = 'red',
      width = '2px',
      style = 'solid',
    } = options;

    element.classList.add('ads-debug-border', `ads-debug-border-${color}`);
    (element as HTMLElement).style.border = `${width} ${style} ${color}`;
  }

  /**
   * Update overlay element in DOM
   */
  private _updateOverlayElement(): void {
    if (typeof window === 'undefined') return;

    let overlay = document.getElementById('ads-debug-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ads-debug-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.85);
        color: #0f0;
        padding: 15px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        max-width: 300px;
        max-height: 400px;
        overflow: auto;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">AdServer Debug</div>
      ${Object.entries(this._overlay.data)
        .map(([key, value]) => `<div>${key}: ${JSON.stringify(value)}</div>`)
        .join('')}
    `;
  }

  /**
   * Remove overlay element from DOM
   */
  private _removeOverlayElement(): void {
    if (typeof window === 'undefined') return;

    const overlay = document.getElementById('ads-debug-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}
