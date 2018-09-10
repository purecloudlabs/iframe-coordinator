import { ClientProgram } from "../elm/ClientProgram.elm";

let worker = null;

function start(expectedOrigin) {
  if (!worker) {
    worker = ClientProgram.worker();

    window.addEventListener("message", event => {
      worker.ports.coordinatorIn.send({
        origin: event.origin,
        data: event.data
      });
    });

    worker.ports.coordinatorOut.subscribe(message => {
      window.parent.postMessage(message, "*");
    });

    onLinkClick((location: LocationMsg) => {
      worker.ports.componentIn.send({
        msgType: "navRequest",
        msg: location
      });
    });
  }
  return worker;
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
  start: start
};
