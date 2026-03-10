import type { ZodSchema } from 'zod';

export const storage = {
  get: <T>(key: string, schema: ZodSchema<T>): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const validated = schema.safeParse(parsed);

      if (validated.success) {
        return validated.data;
      } else {
        console.error(`Storage validation failed for key "${key}":`, validated.error);
        return null; // Or handle parsing errors based on your specific logic
      }
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },
};
