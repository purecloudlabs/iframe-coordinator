import { Host } from "../elm/Host.elm";
import ClientFrame from "./x-ifc-frame";
import { LabeledMsg, Publication } from "../libs/types";

const ROUTE_ATTR = "route";

interface SubscribeHandler {
  (msg: LabeledMsg): void;
}

interface Host {
  ports: {
    fromHost: {
      send(message): void;
    };
    toHost: {
      subscribe(SubscribeHandler): void;
    };
    toClient: {
      subscribe(SubscribeHandler): void;
    };
  };
}

/**
 * The frame-router custom element
 *
 * Events:
 * @event toastRequest
 * @type {object}
 * @param {object} detail - Details of the toast.
 * @param {string} detail.message - Toast message.
 * @param {string=} detail.title - Optional toast title.
 * @param {object=} detail.x - Optional, custom properties for application-specific toast features
 */
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

    this.router.ports.toHost.subscribe(labeledMsg => {
      this.dispatchEvent(
        new CustomEvent(labeledMsg.msgType, { detail: labeledMsg.msg })
      );
    });

    this.router.ports.toClient.subscribe(message => {
      let frame = this.getElementsByTagName("x-ifc-frame")[0] as ClientFrame;
      if (frame) {
        frame.send(message);
      }
    });
  }

  subscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msgType: "subscribe",
      msg: topic
    });
  }

  unsubscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msgType: "unsubscribe",
      msg: topic
    });
  }

  publish(publication: Publication): void {
    this.router.ports.fromHost.send({
      msgType: "publish",
      msg: publication
    });
  }

  changeRoute(location) {
    this.router.ports.fromHost.send({
      msgType: "navRequest",
      msg: location
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === ROUTE_ATTR && oldValue !== newValue) {
      let location = {
        href: "",
        host: "",
        hostname: "",
        protocol: "",
        origin: "",
        port: "",
        pathname: "",
        search: "",
        hash: newValue,
        username: "",
        password: ""
      };
      this.changeRoute(location);
    }
  }
}

export default FrameRouterElement;
