/**
 * Validation Tests - Input validation for security
 */

import { describe, it, expect } from 'vitest';
import {
  validateSlotId,
  validateUrl,
  validateNumberRange,
  validateCspNonce,
  validateApiEndpoint,
  validateTimeout,
  validateCacheTTL,
  validateRetryAttempts,
  validateRetryDelay,
  ValidationErrorCode,
  ValidationError,
  type ValidationResult,
} from './validation.js';

describe('validateSlotId', () => {
  it('should accept valid slot IDs', () => {
    expect(validateSlotId('banner-1').valid).toBe(true);
    expect(validateSlotId('sidebar_300x250').valid).toBe(true);
    expect(validateSlotId('ABC123-xyz_456').valid).toBe(true);
    expect(validateSlotId('a').valid).toBe(true); // minimum length
    expect(validateSlotId('a'.repeat(100)).valid).toBe(true); // maximum length
  });

  it('should reject empty slot IDs', () => {
    const result = validateSlotId('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.EMPTY_SLOT_ID);
  });

  it('should reject slot IDs with invalid characters', () => {
    const invalidIds = [
      'banner 1', // space
      'banner@1', // special char
      'banner#1', // special char
      'banner$1', // special char
      'banner%1', // special char
      'banner&1', // special char
      'banner*1', // special char
      'banner+1', // special char
      'banner/1', // special char
      'banner=1', // special char
      'banner?1', // special char
      'banner^1', // special char
      'banner`1', // special char
      'banner{1', // special char
      'banner|1', // special char
      'banner}1', // special char
      'banner~1', // special char
      'banner[1', // special char
      'banner]1', // special char
      'banner\\1', // backslash
      'banner<1', // special char
      'banner>1', // special char
      'banner,1', // comma
      'banner.1', // dot
      'banner;1', // semicolon
      'banner:1', // colon
      "'banner'", // quotes
      '"banner"', // double quotes
    ];

    for (const id of invalidIds) {
      const result = validateSlotId(id);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ValidationErrorCode.INVALID_SLOT_ID_FORMAT);
    }
  });

  it('should reject slot IDs that are too short', () => {
    const result = validateSlotId('');
    expect(result.valid).toBe(false);
  });

  it('should reject slot IDs that are too long', () => {
    const result = validateSlotId('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.SLOT_ID_TOO_LONG);
  });

  it('should reject non-string input', () => {
    const result = validateSlotId(null as unknown as string);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.INVALID_TYPE);
  });

  it('should reject slot IDs starting with number', () => {
    const result = validateSlotId('123-banner');
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.INVALID_SLOT_ID_FORMAT);
  });

  it('should reject slot IDs starting with special characters', () => {
    expect(validateSlotId('-banner').valid).toBe(false);
    expect(validateSlotId('_banner').valid).toBe(false);
    expect(validateSlotId('-').valid).toBe(false);
    expect(validateSlotId('_').valid).toBe(false);
  });
});

describe('validateUrl', () => {
  it('should accept valid URLs', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('http://example.com').valid).toBe(true);
    expect(validateUrl('https://example.com/path?query=value').valid).toBe(true);
    expect(validateUrl('https://example.com:8080').valid).toBe(true);
    expect(validateUrl('https://subdomain.example.com').valid).toBe(true);
    expect(validateUrl('/api/v1').valid).toBe(true); // relative URL
    expect(validateUrl('//example.com').valid).toBe(true); // protocol-relative
  });

  it('should reject invalid URLs', () => {
    const invalidUrls = [
      'not a url',
      'ht!tp://example.com',
      'https://',
      'http://',
      '//',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
    ];

    for (const url of invalidUrls) {
      const result = validateUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ValidationErrorCode.INVALID_URL);
    }
  });

  it('should reject non-string input', () => {
    const result = validateUrl(null as unknown as string);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.INVALID_TYPE);
  });

  it('should reject dangerous protocols', () => {
    const dangerousUrls = [
      'javascript:void(0)',
      'javascript:alert(document.cookie)',
      'data:text/html;charset=utf-8,<script>alert(1)</script>',
      'vbscript:alert(1)',
      'file:///etc/passwd',
      'chrome-extension://xyz',
      'moz-extension://xyz',
    ];

    for (const url of dangerousUrls) {
      const result = validateUrl(url);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ValidationErrorCode.INVALID_URL);
    }
  });

  it('should accept URLs with allowed protocols only', () => {
    expect(validateUrl('https://example.com').valid).toBe(true);
    expect(validateUrl('http://example.com').valid).toBe(true);
    expect(validateUrl('/relative/path').valid).toBe(true);
    expect(validateUrl('//protocol-relative.com').valid).toBe(true);
  });
});

describe('validateNumberRange', () => {
  it('should accept numbers within range', () => {
    expect(validateNumberRange(5, 0, 10).valid).toBe(true);
    expect(validateNumberRange(0, 0, 10).valid).toBe(true);
    expect(validateNumberRange(10, 0, 10).valid).toBe(true);
    expect(validateNumberRange(-5, -10, 10).valid).toBe(true);
  });

  it('should reject numbers outside range', () => {
    expect(validateNumberRange(11, 0, 10).valid).toBe(false);
    expect(validateNumberRange(-1, 0, 10).valid).toBe(false);
    expect(validateNumberRange(100, 0, 10).valid).toBe(false);
  });

  it('should reject non-number input', () => {
    expect(validateNumberRange('5' as unknown as number, 0, 10).valid).toBe(false);
    expect(validateNumberRange(null as unknown as number, 0, 10).valid).toBe(false);
    expect(validateNumberRange(undefined as unknown as number, 0, 10).valid).toBe(false);
    expect(validateNumberRange(NaN, 0, 10).valid).toBe(false);
  });

  it('should handle Infinity', () => {
    expect(validateNumberRange(Infinity, 0, 10).valid).toBe(false);
    expect(validateNumberRange(-Infinity, 0, 10).valid).toBe(false);
  });
});

describe('validateCspNonce', () => {
  it('should accept valid CSP nonces', () => {
    expect(validateCspNonce('abc123').valid).toBe(true);
    expect(validateCspNonce('ABC-xyz_123').valid).toBe(true);
    expect(validateCspNonce('a'.repeat(128)).valid).toBe(true);
    expect(validateCspNonce('').valid).toBe(true); // empty is valid (optional)
  });

  it('should reject nonces with invalid characters', () => {
    const invalidNonces = [
      'nonce with spaces',
      'nonce@special',
      'nonce#hash',
      'nonce$sign',
      'nonce%percent',
      'nonce&ampersand',
      'nonce*asterisk',
      'nonce+plus',
      'nonce/slash',
      'nonce=equal',
      'nonce?question',
      'nonce^caret',
      'nonce`backtick',
      'nonce|pipe',
      'nonce~tilde',
    ];

    for (const nonce of invalidNonces) {
      const result = validateCspNonce(nonce);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(ValidationErrorCode.INVALID_NONCE_FORMAT);
    }
  });

  it('should reject nonces that are too long', () => {
    const result = validateCspNonce('a'.repeat(129));
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.NONCE_TOO_LONG);
  });

  it('should reject non-string input', () => {
    const result = validateCspNonce(null as unknown as string);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(ValidationErrorCode.INVALID_TYPE);
  });
});

describe('validateApiEndpoint', () => {
  it('should accept valid API endpoints', () => {
    expect(validateApiEndpoint('/api/v1').valid).toBe(true);
    expect(validateApiEndpoint('https://api.example.com/v1').valid).toBe(true);
    expect(validateApiEndpoint('http://localhost:8080/api').valid).toBe(true);
    expect(validateApiEndpoint('//api.example.com/v1').valid).toBe(true);
  });

  it('should reject invalid endpoints', () => {
    expect(validateApiEndpoint('javascript:alert(1)').valid).toBe(false);
    expect(validateApiEndpoint('not a url').valid).toBe(false);
    expect(validateApiEndpoint('').valid).toBe(false);
  });
});

describe('validateTimeout', () => {
  it('should accept valid timeouts', () => {
    expect(validateTimeout(100).valid).toBe(true);
    expect(validateTimeout(1000).valid).toBe(true);
    expect(validateTimeout(5000).valid).toBe(true);
    expect(validateTimeout(60000).valid).toBe(true);
  });

  it('should reject invalid timeouts', () => {
    expect(validateTimeout(99).valid).toBe(false);
    expect(validateTimeout(60001).valid).toBe(false);
    expect(validateTimeout(0).valid).toBe(false);
    expect(validateTimeout(-100).valid).toBe(false);
  });
});

describe('validateCacheTTL', () => {
  it('should accept valid TTL values', () => {
    expect(validateCacheTTL(0).valid).toBe(true);
    expect(validateCacheTTL(1000).valid).toBe(true);
    expect(validateCacheTTL(300000).valid).toBe(true);
    expect(validateCacheTTL(3600000).valid).toBe(true);
  });

  it('should reject invalid TTL values', () => {
    expect(validateCacheTTL(-1).valid).toBe(false);
    expect(validateCacheTTL(3600001).valid).toBe(false);
  });
});

describe('validateRetryAttempts', () => {
  it('should accept valid retry attempts', () => {
    expect(validateRetryAttempts(0).valid).toBe(true);
    expect(validateRetryAttempts(3).valid).toBe(true);
    expect(validateRetryAttempts(10).valid).toBe(true);
  });

  it('should reject invalid retry attempts', () => {
    expect(validateRetryAttempts(-1).valid).toBe(false);
    expect(validateRetryAttempts(11).valid).toBe(false);
  });
});

describe('validateRetryDelay', () => {
  it('should accept valid retry delays', () => {
    expect(validateRetryDelay(100).valid).toBe(true);
    expect(validateRetryDelay(1000).valid).toBe(true);
    expect(validateRetryDelay(60000).valid).toBe(true);
  });

  it('should reject invalid retry delays', () => {
    expect(validateRetryDelay(99).valid).toBe(false);
    expect(validateRetryDelay(60001).valid).toBe(false);
    expect(validateRetryDelay(0).valid).toBe(false);
    expect(validateRetryDelay(-100).valid).toBe(false);
  });
});

describe('ValidationError', () => {
  it('should create error with code and message', () => {
    const error = new ValidationError(
      ValidationErrorCode.INVALID_SLOT_ID_FORMAT,
      'Invalid slot ID format'
    );

    expect(error.code).toBe(ValidationErrorCode.INVALID_SLOT_ID_FORMAT);
    expect(error.message).toBe('Invalid slot ID format');
    expect(error.name).toBe('ValidationError');
  });

  it('should be instance of Error', () => {
    const error = new ValidationError(
      ValidationErrorCode.INVALID_URL,
      'Invalid URL'
    );

    expect(error instanceof Error).toBe(true);
    expect(error instanceof ValidationError).toBe(true);
  });
});
