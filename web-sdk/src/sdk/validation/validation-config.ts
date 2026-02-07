/**
 * Validation Config - Configuration validation
 */

import { ValidationResult, ValidationErrorCode, isString, isNumber } from './validation-base.js';

/**
 * Constants for validation
 */
const CSP_NONCE_MAX_LENGTH = 128;

// Regex patterns
const CSP_NONCE_PATTERN = /^[a-zA-Z0-9_-]*$/;

/**
 * Validate number is within range
 */
export function validateNumberRange(
  value: unknown,
  min: number,
  max: number
): ValidationResult {
  // Type check
  if (!isNumber(value)) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_TYPE,
      message: 'Value must be a number',
    };
  }

  // Range check
  if (value < min || value > max) {
    return {
      valid: false,
      error: ValidationErrorCode.OUT_OF_RANGE,
      message: `Value must be between ${min} and ${max}`,
    };
  }

  return { valid: true };
}

/**
 * Validate CSP nonce
 * - Can be empty (optional)
 * - If provided, must contain only alphanumeric, hyphens, underscores
 * - Maximum 128 characters
 */
export function validateCspNonce(nonce: unknown): ValidationResult {
  // Type check
  if (!isString(nonce)) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_TYPE,
      message: 'Nonce must be a string',
    };
  }

  // Empty is valid (nonce is optional)
  if (nonce.length === 0) {
    return { valid: true };
  }

  // Length check
  if (nonce.length > CSP_NONCE_MAX_LENGTH) {
    return {
      valid: false,
      error: ValidationErrorCode.NONCE_TOO_LONG,
      message: `Nonce cannot exceed ${CSP_NONCE_MAX_LENGTH} characters`,
    };
  }

  // Format check
  if (!CSP_NONCE_PATTERN.test(nonce)) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_NONCE_FORMAT,
      message: 'Nonce must contain only letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Validate API timeout
 * - Must be between 100 and 60000ms
 */
export function validateApiTimeout(timeout: unknown): ValidationResult {
  return validateNumberRange(timeout, 100, 60000);
}

/**
 * Validate cache TTL
 * - Must be between 0 and 3600000ms (1 hour)
 */
export function validateCacheTTL(ttl: unknown): ValidationResult {
  return validateNumberRange(ttl, 0, 3600000);
}

/**
 * Validate retry attempts
 * - Must be between 0 and 10
 */
export function validateRetryAttempts(attempts: unknown): ValidationResult {
  return validateNumberRange(attempts, 0, 10);
}

/**
 * Validate retry delay
 * - Must be between 100 and 60000ms
 */
export function validateRetryDelay(delay: unknown): ValidationResult {
  return validateNumberRange(delay, 100, 60000);
}

/**
 * Validate timeout (alias for validateApiTimeout)
 */
export const validateTimeout = validateApiTimeout;
