import { Filter } from './filtering/Filter';

// Main Class

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
      url: null
    };
    this._clients.forEach(client => {
      const clientRoute = matchAndStripPrefix(route, client.assignedRoute);
      if (clientRoute !== null) {
        clientTarget = {
          id: client.id,
          url: applyRoute(client.url, clientRoute),
          filteredTopics: client.filteredTopics
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
  /** A filter for keyboard events */
  filteredTopics?: Map<string, Filter>;
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
  /** A filter for keyboard events */
  filteredTopics?: any;
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
    filteredTopics: transformFilteredTopics(value.filteredTopics)
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

/**
 * who cares
 * @param filteredTopics whatever
 */
function transformFilteredTopics(filteredTopics: any): Map<string, Filter> {
  const retVal = new Map();

  if (!filteredTopics) {
    return retVal;
  }

  for (const topic of Object.keys(filteredTopics)) {
    retVal.set(topic, filteredTopics[topic]);
  }

  return retVal;
}

/**
 * Removes leading and trailing slashes from a route to simplify comparisons
 * against other paths.
 *
 * @external
 */
function normalizeRoute(route: string): string {
  return stripLeadingSlash(stripTrailingSlash(route));
}

/**
 * Removes any leading '/' characters from a string.
 *
 * @external
 */
function stripLeadingSlash(str: string): string {
  return str.replace(/^\/+/, '');
}

/**
 * Removes any trailing '/' characters from a string.
 *
 * @external
 */
function stripTrailingSlash(str: string): string {
  return str.replace(/\/+$/, '');
}
