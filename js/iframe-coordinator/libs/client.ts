import { Client, Worker } from "../elm/Client.elm";
import { Location, WorkaroundAnchor } from "../libs/types";

let worker: Worker = null;

function start() {
  if (!worker) {
    worker = Client.worker();

    window.addEventListener("message", (event: MessageEvent) => {
      worker.ports.fromHost.send({
        origin: event.origin,
        data: event.data
      });
    });

    worker.ports.toHost.subscribe((message: any) => {
      window.parent.postMessage(message, "*");
    });

    onLinkClick((location: Location) => {
      worker.ports.fromClient.send({
        msgType: "navRequest",
        msg: location
      });
    });

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
    worker.requestToast = function (message: string, {title = null, custom = null}: undefined | ToastOptions = {}): void {
      worker.ports.fromClient.send({
        msgType: "toastRequest",
        msg: {
          title,
          message,
          custom
        }
      });
    };
  }

  return worker;
}

function onLinkClick(callback: (loc: Location) => void) {
  window.addEventListener("click", (event: MouseEvent) => {
    let target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === "a" && event.button == 0) {
      event.preventDefault();
      let a = event.target as WorkaroundAnchor;
      let location = {
        href: a.href,
        host: a.host,
        hostname: a.hostname,
        protocol: a.protocol,
        origin: a.origin,
        port: a.port,
        pathname: a.pathname,
        search: a.search,
        hash: a.hash,
        username: a.username,
        password: a.password
      };

      callback(location);
    }
  });
}

interface ToastOptions {
  title?: string,
  custom?: { [x: string]: any }
}

export default {
  start: start
};
