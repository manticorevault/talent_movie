import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../sanitize';

describe('sanitizeInput', () => {
  it('should strip angle brackets', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('should strip double quotes', () => {
    expect(sanitizeInput('Hello "world"')).toBe('Hello world');
  });

  it('should strip single quotes', () => {
    expect(sanitizeInput("it's fine")).toBe('its fine');
  });

  it('should strip ampersands', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom  Jerry');
  });

  it('should leave clean text untouched', () => {
    expect(sanitizeInput('The Dark Knight Rises')).toBe('The Dark Knight Rises');
  });

  it('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should strip all dangerous characters at once', () => {
    expect(sanitizeInput('<"hello" & \'world\'>')).toBe('hello  world');
  });
});
