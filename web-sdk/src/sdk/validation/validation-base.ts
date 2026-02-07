/**
 * Validation Base - Base validation types and utilities
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
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number (excluding NaN and Infinity)
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

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
