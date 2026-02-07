/**
 * Validation URL - URL validation
 */

import { ValidationResult, ValidationErrorCode, isString } from './validation-base.js';

// Regex patterns
const DANGEROUS_PROTOCOLS_PATTERN = /^(javascript|data|vbscript|file|chrome-extension|moz-extension):/i;

/**
 * Validate URL
 * - Must be a valid URL (absolute or relative)
 * - Must not use dangerous protocols (javascript:, data:, etc.)
 */
export function validateUrl(url: unknown): ValidationResult {
  // Type check
  if (!isString(url)) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_TYPE,
      message: 'URL must be a string',
    };
  }

  // Empty check
  if (url.length === 0) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_URL,
      message: 'URL cannot be empty',
    };
  }

  // Check for dangerous protocols
  if (DANGEROUS_PROTOCOLS_PATTERN.test(url.trim())) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_URL,
      message: 'URL contains dangerous protocol',
    };
  }

  // Try to parse as URL
  try {
    // For relative URLs, prepend a dummy base to validate
    if (url.startsWith('/') || url.startsWith('//') || url.startsWith('.')) {
      new URL(url, 'http://dummy-base.com');
    } else {
      new URL(url);
    }
  } catch {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_URL,
      message: 'Invalid URL format',
    };
  }

  return { valid: true };
}

/**
 * Validate API endpoint URL
 */
export function validateApiEndpoint(endpoint: unknown): ValidationResult {
  return validateUrl(endpoint);
}
