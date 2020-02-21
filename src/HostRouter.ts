// Main Class
import {
  normalizeRoute,
  stripLeadingSlash,
  stripTrailingSlash
} from './urlUtils';

/**
 * HostRouter is responsible for mapping route paths to
 * corresponding client URls.
 * @external
 */
export class HostRouter {
  private _clients: ClientInfo[];

  constructor(clients: RoutingMap) {
    this._clients = Object.keys(clients).map(id => {
      return parseRegistration(id, clients[id]);
    });
  }

  /**
   * Gets the client id and url for the provided route.
   *
   * @param route The route to lookup, such as '/foo/bar/baz'
   */
  public getClientTarget(route: string): ClientTarget {
    let clientTarget: ClientTarget = {
      id: null,
      url: null,
      assignedRoute: null
    };
    this._clients.forEach(client => {
      const clientRoute = matchAndStripPrefix(route, client.assignedRoute);
      if (clientRoute !== null) {
        clientTarget = {
          id: client.id,
          url: applyRoute(client.url, clientRoute),
          assignedRoute: client.assignedRoute,
          allow: client.allow,
          sandbox: client.sandbox
        };
      }
    });

    return clientTarget;
  }
}

// Utility Types

/**
 * Data representing the id of a client app to display
 * and a target URL to show in that app.
 */
export interface ClientTarget {
  /** The id of the target client */
  id: string | null;
  /** The target URL to show */
  url: string | null;
  /** The assigned route of the client */
  assignedRoute: string | null;
  /** iframe's allow directive */
  allow?: string;
  /** iframe's sandbox directive to be merged with defaults */
  sandbox?: string;
}

/**
 * A map from client identifiers to configuration describing
 * where the client app is hosted, and what routes should be
 * directed to it.
 */
export interface RoutingMap {
  [key: string]: ClientRegistration;
}

/**
 * Client routing description. The 'url' parameter is the location where
 * the client application is hosted. If the client uses fragment-based
 * routing, the URL shoudl include a hash fragment, e.g. http://example.com/client/#/
 * if the client uses pushstate path-based routing, leave the fragment out
 * e.g. http://example.com/client
 *
 * The assigned route is the prefix for all routes that will be mapped to this client.
 * This prefix will be stripped when setting the route on the client. As an example,
 * if the assignedRoute is '/foo/bar/', and {@link HostRouter.getClientUrl} is passed
 * the route '/foo/bar/baz/qux', the client generated client Url will look something
 * like http://example.com/client/#/baz/qux
 */
interface ClientRegistration {
  /** The URL where the client application is hosted */
  url: string;
  /** The host route that should map to this client app */
  assignedRoute: string;
  /** iframe's allow directive */
  allow?: string;
  /** iframe's sandbox directive to be merged with defaults */
  sandbox?: string;
}

/**
 * An internal client representation that moves the identifying key from {@link RoutingMap}
 * into the information about the client.
 *
 * @external
 */
interface ClientInfo extends ClientRegistration {
  /** An identifier for the client app */
  id: string;
}

// Helper functions

/**
 * Checks a requested route against a specific assigned route (excluding leading slashes),
 * and if they match, returns the section of the requested route that should be passed
 * to the client.
 *
 * @external
 *
 * @param rawTargetRoute The route to check against the client route
 * @param clientRoute The route prefix being checked.
 *
 * @returns The non-matching part of the target route if clientRoute is a prefix of it. This
 * will be an empty string in the event of an exact match. If the clientRoute and targetRoute do
 * not match, null is returned.
 */
function matchAndStripPrefix(
  rawTargetRoute: string,
  clientRoute: string
): string | null {
  const targetRoute = stripLeadingSlash(rawTargetRoute);
  if (targetRoute.startsWith(clientRoute)) {
    const newRoute = targetRoute.replace(clientRoute, '');
    return stripLeadingSlash(newRoute);
  } else {
    return null;
  }
}

/**
 * Helper function for converting {@link RoutingMap} data into an the internal
 * {@link ClientInfo} representation.
 *
 * @external
 */
function parseRegistration(key: string, value: ClientRegistration): ClientInfo {
  return {
    id: key,
    url: value.url,
    assignedRoute: normalizeRoute(value.assignedRoute),
    allow: value.allow,
    sandbox: value.sandbox
  };
}

/**
 * Helper function that combines a client URL with a client route to generate
 * a full URL. Check the client URL for a hash fragment to see if fragment-based
 * or path-based routing should be used.
 *
 * @external
 */
function applyRoute(urlStr: string, route: string): string {
  const newUrl = new URL(urlStr, window.location.href);
  if (newUrl.hash) {
    const baseClientRoute = stripTrailingSlash(newUrl.hash);
    newUrl.hash = `${baseClientRoute}/${route}`;
  } else {
    const baseClientPath = stripTrailingSlash(newUrl.pathname);
    newUrl.pathname = `${baseClientPath}/${route}`;
  }
  return newUrl.toString();
}
