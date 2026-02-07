/**
 * Validation - Input validation for security and data integrity
 */

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  EMPTY_SLOT_ID = 'EMPTY_SLOT_ID',
  INVALID_SLOT_ID_FORMAT = 'INVALID_SLOT_ID_FORMAT',
  SLOT_ID_TOO_LONG = 'SLOT_ID_TOO_LONG',
  INVALID_URL = 'INVALID_URL',
  INVALID_TYPE = 'INVALID_TYPE',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  INVALID_NONCE_FORMAT = 'INVALID_NONCE_FORMAT',
  NONCE_TOO_LONG = 'NONCE_TOO_LONG',
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: ValidationErrorCode;
  message?: string;
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public readonly code: ValidationErrorCode;

  constructor(code: ValidationErrorCode, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Constants for validation
 */
const SLOT_ID_MAX_LENGTH = 100;
const CSP_NONCE_MAX_LENGTH = 128;

// Regex patterns
const SLOT_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const CSP_NONCE_PATTERN = /^[a-zA-Z0-9_-]*$/;
const DANGEROUS_PROTOCOLS_PATTERN = /^(javascript|data|vbscript|file|chrome-extension|moz-extension):/i;

/**
 * Check if value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number (excluding NaN and Infinity)
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

/**
 * Validate slot ID format
 * - Must be 1-100 characters
 * - Must start with a letter
 * - Can contain letters, numbers, hyphens, and underscores
 */
export function validateSlotId(slotId: unknown): ValidationResult {
  // Type check
  if (!isString(slotId)) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_TYPE,
      message: 'Slot ID must be a string',
    };
  }

  // Empty check
  if (slotId.length === 0) {
    return {
      valid: false,
      error: ValidationErrorCode.EMPTY_SLOT_ID,
      message: 'Slot ID cannot be empty',
    };
  }

  // Length check
  if (slotId.length > SLOT_ID_MAX_LENGTH) {
    return {
      valid: false,
      error: ValidationErrorCode.SLOT_ID_TOO_LONG,
      message: `Slot ID cannot exceed ${SLOT_ID_MAX_LENGTH} characters`,
    };
  }

  // Format check
  if (!SLOT_ID_PATTERN.test(slotId)) {
    return {
      valid: false,
      error: ValidationErrorCode.INVALID_SLOT_ID_FORMAT,
      message: 'Slot ID must start with a letter and contain only letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true };
}

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
 * Validate API endpoint URL
 */
export function validateApiEndpoint(endpoint: unknown): ValidationResult {
  return validateUrl(endpoint);
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

/**
 * Batch validation helper
 */
export function validateBatch(
  validators: Array<() => ValidationResult>
): ValidationResult {
  for (const validator of validators) {
    const result = validator();
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Assert validation or throw error
 */
export function assertValid(result: ValidationResult): void {
  if (!result.valid) {
    throw new ValidationError(result.error as ValidationErrorCode, result.message || 'Validation failed');
  }
}
