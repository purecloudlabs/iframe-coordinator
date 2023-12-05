/**
 * Removes leading and trailing slashes from a route to simplify comparisons
 * against other paths.
 *
 */
export function normalizeRoute(route: string): string {
  return stripLeadingSlash(stripTrailingSlash(route));
}

/**
 * Removes any leading '/' characters from a string.
 *
 */
export function stripLeadingSlash(str: string): string {
  return str.replace(/^\/+/, "");
}

/**
 * Removes any trailing '/' characters from a string.
 *
 */
export function stripTrailingSlash(str: string): string {
  return str.replace(/\/+$/, "");
}

/**
 * Removes any leading '/' or '#' characters from a string.
 *
 */
export function stripLeadingSlashAndHashTag(str: string): string {
  return str.replace(/^(\/|#)+/, "");
}

/**
 * Join multiple routes into one URL.
 *
 */
export function joinRoutes(...routes: string[]): string {
  return routes
    .reduce((acc, route) => {
      const normalizedRoute = normalizeRoute(route);

      if (normalizedRoute) {
        return acc.concat([normalizedRoute]);
      }

      return acc;
    }, [] as string[])
    .join("/");
}
