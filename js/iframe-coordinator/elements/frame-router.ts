import { Host } from "../elm/Host.elm";
import { LabeledMsg } from "../libs/types";

const ROUTE_ATTR = "route";

interface SubscribeHandler {
  (msg: LabeledMsg): void;
}

interface Host {
  ports: {
    fromClient: {
      send: (message) => void;
    };
    fromHost: {
      send: (message) => void;
    };
    toHost: {
      subscribe(SubscribeHandler): void;
    };
  };
}

class FrameRouterElement extends HTMLElement {
  router: Host;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return [ROUTE_ATTR];
  }

  connectedCallback() {
    this.setAttribute("style", "position: relative;");
  }

  registerClients(clients) {
    this.router = Host.embed(this, clients);

    window.addEventListener("message", event => {
      this.router.ports.fromClient.send(event.data);
    });

    this.router.ports.toHost.subscribe(message => {
      if (message.msgType === "navRequest") {
        let event = new CustomEvent("navRequest", { detail: message.msg });
        this.dispatchEvent(event);
      }
    });
  }

  changeRoute (location) {
    this.router.ports.fromHost.send({
      msgType: "navRequest",
      msg: location
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if ((name === ROUTE_ATTR) && (oldValue !== newValue)) {
      let location = {
        href: '',
        host: '',
        hostname: '',
        protocol: '',
        origin: '',
        port: '',
        pathname: '',
        search: '',
        hash: newValue,
        username: '',
        password: ''
      };
      this.changeRoute(location);
    }
  }
}

export default FrameRouterElement;
