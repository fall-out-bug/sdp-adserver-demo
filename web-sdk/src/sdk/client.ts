/**
 * Client - Delivery API client with retry logic
 */

import { getConfig } from './config.js';
import type { CachedBanner } from './cache.js';

export interface DeliveryRequest {
  slotID: string;
  width?: number;
  height?: number;
  referer?: string;
}

export interface DeliveryResponse {
  creative: {
    html: string;
    width: number;
    height: number;
  };
  tracking: {
    impression: string;
    click: string;
  };
  fallback?: {
    enabled: boolean;
    html?: string;
  };
}

interface ClientError extends Error {
  statusCode?: number;
  retryable?: boolean;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function getRetryDelay(attempt: number): number {
  const baseDelay = getConfig().retryDelay;
  const exponentialDelay = Math.min(baseDelay * 2 ** attempt, 8000); // Max 8s
  const jitter = Math.random() * 500; // Up to 500ms jitter
  return exponentialDelay + jitter;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // Network errors (no response)
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return true;
  }

  // HTTP status codes that are retryable
  const clientError = error as ClientError;
  if (clientError.statusCode) {
    // Retry on 408 (Request Timeout), 429 (Too Many Requests), 5xx errors
    return clientError.statusCode === 408 ||
           clientError.statusCode === 429 ||
           clientError.statusCode >= 500;
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch banner from Delivery API
 */
export async function fetchBanner(
  request: DeliveryRequest,
  signal?: AbortSignal
): Promise<DeliveryResponse> {
  const config = getConfig();
  const { apiEndpoint, apiTimeout, retryEnabled, retryMaxAttempts } = config;

  const url = new URL(`${apiEndpoint}/delivery/${request.slotID}`, window.location.href);

  // Add query parameters
  if (request.width) url.searchParams.set('width', request.width.toString());
  if (request.height) url.searchParams.set('height', request.height.toString());
  if (request.referer) url.searchParams.set('referer', request.referer);

  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= (retryEnabled ? retryMaxAttempts : 0); attempt++) {
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1);
      console.log(`[AdServerSDK] Retry attempt ${attempt}/${retryMaxAttempts} after ${delay}ms`);
      await sleep(delay);
    }

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiTimeout);

      // Combine external signal with timeout
      const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ClientError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.statusCode = response.status;
        error.retryable = isRetryableError(error);
        throw error;
      }

      const data: DeliveryResponse = await response.json();

      // Validate response structure
      if (!data.creative || !data.tracking) {
        throw new Error('Invalid response structure: missing creative or tracking');
      }

      return data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request aborted or timed out');
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        break;
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('Failed to fetch banner after retries');
}

/**
 * Fetch banner and convert to cached format
 */
export async function fetchBannerCached(
  request: DeliveryRequest,
  signal?: AbortSignal
): Promise<CachedBanner> {
  const response = await fetchBanner(request, signal);

  return {
    html: response.creative.html,
    width: response.creative.width,
    height: response.creative.height,
    clickURL: response.tracking.click,
    impression: response.tracking.impression,
    campaignID: '', // Will be populated by backend
  };
}

/**
 * Get delivery URL for a slot
 */
export function getDeliveryURL(slotID: string): string {
  const config = getConfig();
  return `${config.apiEndpoint}/delivery/${slotID}`;
}

/**
 * Create delivery request object
 */
export function createDeliveryRequest(
  slotID: string,
  options?: Partial<DeliveryRequest>
): DeliveryRequest {
  return {
    slotID,
    width: options?.width,
    height: options?.height,
    referer: options?.referer || window.location.href,
  };
}
