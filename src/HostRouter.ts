interface ClientRegistration {
  url: string;
  assignedRoute: string;
}

interface RoutingMap {
  [key: string]: ClientRegistration;
}

interface ClientInfo extends ClientRegistration {
  id: string;
}

/**
 * HostRouter is responsible for routing messages from the {@link Host}
 * to the underlying iframe.
 */
class HostRouter {
  private _clients: ClientInfo[];

  constructor(clients: RoutingMap) {
    this._clients = Object.keys(clients).map(id => {
      return parseRegistration(id, clients[id]);
    });
  }

  public getClientUrl(rawRoute: string): string | null {
    const route = normalizeRoute(rawRoute);
    this._clients.forEach(client => {
      if (matchAndStripPrefix(route, client.assignedRoute)) {
        return applyRoute(client.url, route);
      }
    });
    return null;
  }
}

function matchAndStripPrefix(
  targetRoute: string,
  clientRoute: string
): string | null {
  if (targetRoute.startsWith(clientRoute)) {
    const newRoute = targetRoute.replace(clientRoute, '');
    return normalizeRoute(newRoute);
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
  const baseClientRoute = stripTrailingSlash(newUrl.hash);
  newUrl.hash = `${baseClientRoute}/${route}`;
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

export { HostRouter, RoutingMap };
