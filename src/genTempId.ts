/**
 * Generates a temporary id which is semi-unique.
 */
export function genTempId(): string {
  return String(Math.floor((1 + Math.random()) * 0x10000));
}
