/**
 * Removes leading and trailing slashes from a route to simplify comparisons
 * against other paths.
 *
 * @external
 */
export function normalizeRoute(route: string): string {
  return stripLeadingSlash(stripTrailingSlash(route));
}

/**
 * Removes any leading '/' characters from a string.
 *
 * @external
 */
export function stripLeadingSlash(str: string): string {
  return str.replace(/^\/+/, '');
}

/**
 * Removes any trailing '/' characters from a string.
 *
 * @external
 */
export function stripTrailingSlash(str: string): string {
  return str.replace(/\/+$/, '');
}

/**
 * Removes any leading '/' or '#' characters from a string.
 *
 * @external
 */
export function stripLeadingSlashAndHashTag(str: string): string {
  return str.replace(/^(\/|#)+/, '');
}

/**
 * Join multiple routes into one URL.
 *
 * @external
 */
export function joinRoutes(...routes: string[]): string {
  return routes.map(route => normalizeRoute(route)).join('/');
}
