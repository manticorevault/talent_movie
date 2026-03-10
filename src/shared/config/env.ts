import { z } from 'zod';

export const envSchema = z.object({
  VITE_TMDB_API_KEY: z.string().min(1, 'TMDB API Key is required.'),
});

// Validate `import.meta.env`
export const env = envSchema.parse(import.meta.env);
