import { Client } from "../elm/Client.elm";

let worker = null;
let messageHandlers = [];

export default {
  start: start,

  subscribe(topic: string): void {
    sendMessage("subscribe", topic);
  },

  unsubscribe(topic: string): void {
    sendMessage("unsubscribe", topic);
  },

  publish(topic: string, data: any): void {
    sendMessage("publish", {
      topic: topic,
      payload: data
    });
  },

  onPubsub(callback) {
    messageHandlers.push(callback);
  },

  requestToast(
    message: string,
    { title = null, custom = null }: undefined | ToastOptions = {}
  ): void {
    sendMessage("toastRequest", {
      title,
      message,
      custom
    });
  }
};

function start(expectedOrigin) {
  if (!worker) {
    worker = Client.worker();

    window.addEventListener("message", event => {
      worker.ports.fromHost.send({
        origin: event.origin,
        data: event.data
      });
    });

    worker.ports.toHost.subscribe(message => {
      window.parent.postMessage(message, "*");
    });

    worker.ports.toClient.subscribe(message => {
      if (message.msgType == "publish") {
        messageHandlers.forEach(handler => {
          handler(message.msg);
        });
      }
    });

    onLinkClick((location: LocationMsg) => {
      sendMessage("navRequest", location);
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
    worker.requestToast = function(
      message: string,
      { title = null, custom = null }: undefined | ToastOptions = {}
    ): void {
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

function sendMessage(type: string, data: any) {
  worker.ports.fromClient.send({
    msgType: type,
    msg: data
  });
}

interface LocationMsg {
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
interface WorkaroundAnchor extends HTMLAnchorElement {
  username: string;
  password: string;
}

function onLinkClick(callback) {
  window.addEventListener("click", event => {
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
  title?: string;
  custom?: { [x: string]: any };
}
