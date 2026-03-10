/**
 * Sanitizes user text input for safe inclusion in query strings.
 * Strips potentially dangerous characters: <, >, ", ', &
 */
export function sanitizeInput(value: string): string {
  return value.replace(/[<>"'&]/g, '');
}
