import { Publication } from '../elm/Host.elm';

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

export type PublicationHandler = (publication: Publication) => void;

export interface ToastOptions {
  title?: string;
  custom?: any;
}

export interface ToastingClient {
  /**
   * Request a toast message be displayed by the host.
   *
   * The page embedding the host is responsible for handling the fired custom event and
   * presenting/styling the toast.  Application-specific concerns such as level, TTLs,
   * ids for action callbacks (toast click, toast action buttons), etc. can be passed via an object
   * as the custom property of the options param.
   *
   * @param {string} message - The message content of the toast
   * @param {object=} options - Supplimental toast options.
   * @param {string=} options.title - Optional title for the toast.
   * @param {object=} options.custom - Optional, application-specific toast properties.  Note: Properties must be JSON serializable.
   *
   * @example
   * worker.requestToast('Hello world');
   *
   * @example
   * worker.requestToast('World', {title: 'Hello'});
   *
   * @example
   * worker.requestToast('World', {title: 'Hello', custom: {ttl: 5, level: 'info'}});
   */
  requestToast(message: string, options?: ToastOptions): void;
}
