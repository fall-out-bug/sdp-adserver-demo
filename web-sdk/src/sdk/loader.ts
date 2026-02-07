/**
 * Loader - Dynamic import loader for async SDK loading
 */

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface LoadOptions {
  timeout?: number;
  preload?: boolean;
}

interface LoadStateInternal {
  state: LoadState;
  error: Error | null;
  startTime: number;
  endTime: number | null;
}

const loadStates: Map<string, LoadStateInternal> = new Map();

/**
 * Get current load state for a script URL
 */
export function getLoadState(url: string): LoadState {
  const state = loadStates.get(url);
  return state?.state ?? 'idle';
}

/**
 * Get load state details
 */
export function getLoadStateDetails(url: string): LoadStateInternal | undefined {
  return loadStates.get(url);
}

/**
 * Load script dynamically
 */
export function loadScript(
  url: string,
  options: LoadOptions = {}
): Promise<void> {
  const existingState = loadStates.get(url);
  if (existingState?.state === 'loaded') {
    return Promise.resolve();
  }

  if (existingState?.state === 'loading') {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const state = loadStates.get(url);
        if (state?.state === 'loaded') {
          clearInterval(checkInterval);
          resolve();
        } else if (state?.state === 'error') {
          clearInterval(checkInterval);
          reject(state.error);
        }
      }, 50);
    });
  }

  // Initialize load state
  const state: LoadStateInternal = {
    state: 'loading',
    error: null,
    startTime: performance.now(),
    endTime: null,
  };
  loadStates.set(url, state);

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // Set timeout
    const timeout = options.timeout ?? 10000; // 10s default
    const timeoutId = setTimeout(() => {
      const error: Error & { isTimeout?: boolean } = new Error(`Script load timeout: ${url}`);
      error.isTimeout = true;
      cleanup(error);
    }, timeout);

    function cleanup(error?: Error) {
      clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;

      const finalState = loadStates.get(url);
      if (finalState) {
        finalState.state = error ? 'error' : 'loaded';
        finalState.error = error ?? null;
        finalState.endTime = performance.now();
      }

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }

    script.onload = () => cleanup();
    script.onerror = () => {
      cleanup(new Error(`Failed to load script: ${url}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Preload script (adds to document head but doesn't execute)
 */
export function preloadScript(url: string): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Load multiple scripts in parallel
 */
export async function loadScripts(urls: string[], options?: LoadOptions): Promise<void> {
  const promises = urls.map(url => loadScript(url, options));
  await Promise.all(promises);
}

/**
 * Load scripts with priority (critical scripts first)
 */
export async function loadScriptsWithPriority(
  scripts: { url: string; critical?: boolean }[],
  options?: LoadOptions
): Promise<void> {
  const critical = scripts.filter(s => s.critical).map(s => s.url);
  const deferred = scripts.filter(s => !s.critical).map(s => s.url);

  // Load critical scripts first
  await loadScripts(critical, options);

  // Load deferred scripts after critical ones complete
  if (deferred.length > 0) {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      await new Promise<void>(resolve => {
        (window as any).requestIdleCallback(() => {
          loadScripts(deferred, options).then(() => resolve());
        });
      });
    } else {
      await loadScripts(deferred, options);
    }
  }
}

/**
 * Clear load states (for testing)
 */
export function clearLoadStates(): void {
  loadStates.clear();
}

/**
 * Get load performance metrics
 */
export function getLoadMetrics(url: string): { duration: number; state: LoadState } | null {
  const state = loadStates.get(url);
  if (!state || state.state === 'loading' || !state.endTime) {
    return null;
  }

  return {
    duration: state.endTime - state.startTime,
    state: state.state,
  };
}
