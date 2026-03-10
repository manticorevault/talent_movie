import { describe, it, expect } from 'vitest';
import { envSchema } from '../env';

describe('env configuration', () => {
  it('should validate correctly with a provided API key', () => {
    const result = envSchema.safeParse({ VITE_TMDB_API_KEY: 'test_api_key_123' });
    expect(result.success).toBe(true);
  });

  it('should throw an error when API key is missing', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
