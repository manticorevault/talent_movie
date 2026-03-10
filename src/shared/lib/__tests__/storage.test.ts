import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { storage } from '../storage';

describe('storage utility', () => {
  const testSchema = z.object({
    id: z.number(),
    name: z.string(),
  });

  type TestType = z.infer<typeof testSchema>;

  beforeEach(() => {
    localStorage.clear();
  });

  it('should set and get a valid item', () => {
    const data: TestType = { id: 1, name: 'Alice' };
    storage.set('user', data);

    const result = storage.get('user', testSchema);
    expect(result).toEqual(data);
  });

  it('should return null for non-existent key', () => {
    const result = storage.get('missing', testSchema);
    expect(result).toBeNull();
  });

  it('should return null for invalid data (fails validation)', () => {
    // Manually set invalid data
    localStorage.setItem('user', JSON.stringify({ id: 'wrong-type', name: 'Bob' }));

    const result = storage.get('user', testSchema);
    expect(result).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    localStorage.setItem('user', 'invalid-json-{');

    const result = storage.get('user', testSchema);
    expect(result).toBeNull();
  });

  it('should remove an item', () => {
    storage.set('user', { id: 1, name: 'Alice' });
    storage.remove('user');

    const result = storage.get('user', testSchema);
    expect(result).toBeNull();
  });
});
