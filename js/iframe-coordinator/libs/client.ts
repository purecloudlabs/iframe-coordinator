import { Client } from "../elm/Client.elm";

let worker = null;

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

    onLinkClick((location: LocationMsg) => {
      sendMessage("navRequest", location);
    });
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

export default {
  start: start,
  publish(topic: string, data: any): void {
    sendMessage("publish", {
      topic: topic,
      payload: data
    });
  }
};
