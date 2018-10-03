export interface Location {
  href: string;
  host: string;
  hostname: string;
  protocol: string;
  origin: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
}

// For some reason, HTMLAnchorElement doesn't define username and password
// TODO: verify username/password support on anchors across browsers.
export interface WorkaroundAnchor extends HTMLAnchorElement {
  username: string;
  password: string;
}