import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.stubEnv('VITE_TMDB_API_KEY', 'test-api-key');
