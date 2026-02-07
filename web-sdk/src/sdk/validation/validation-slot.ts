/**
 * Validation Slot - Slot ID validation
 */

import { ValidationResult, ValidationErrorCode, isString } from './validation-base.js';

/**
 * Constants for validation
 */
const SLOT_ID_MAX_LENGTH = 100;

// Regex patterns
const SLOT_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

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
