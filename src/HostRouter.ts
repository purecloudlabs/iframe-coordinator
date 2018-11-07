// Main Class

/**
 * HostRouter is responsible for routing messages from the {@link Host}
 * to the underlying iframe.
 */
export class HostRouter {
  private _clients: ClientInfo[];

  constructor(clients: RoutingMap) {
    this._clients = Object.keys(clients).map(id => {
      return parseRegistration(id, clients[id]);
    });
  }

  public getClientUrl(route: string): string | null {
    let clientUrl = null;
    this._clients.forEach(client => {
      const clientRoute = matchAndStripPrefix(route, client.assignedRoute);
      if (clientRoute !== null) {
        clientUrl = applyRoute(client.url, clientRoute);
      }
    });

    return clientUrl;
  }
}

// Utility Types

export interface RoutingMap {
  [key: string]: ClientRegistration;
}

interface ClientRegistration {
  url: string;
  assignedRoute: string;
}

interface ClientInfo extends ClientRegistration {
  id: string;
}

// Helper functions

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

function parseRegistration(key: string, value: ClientRegistration): ClientInfo {
  return {
    id: key,
    url: value.url,
    assignedRoute: normalizeRoute(value.assignedRoute)
  };
}

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

function normalizeRoute(route: string): string {
  return stripLeadingSlash(stripTrailingSlash(route));
}

function stripLeadingSlash(str: string): string {
  return str.replace(/^\/+/, '');
}

function stripTrailingSlash(str: string): string {
  return str.replace(/\/+$/, '');
}
