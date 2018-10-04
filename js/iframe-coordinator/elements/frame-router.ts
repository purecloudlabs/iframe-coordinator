import { Elm, Publication } from "../elm/Host.elm";
import ClientFrame from "./x-ifc-frame";

const ROUTE_ATTR = "route";

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
  router: HostProgram;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return [ROUTE_ATTR];
  }

  connectedCallback() {
    this.setAttribute("style", "position: relative;");
  }

  registerClients(clients: ClientRegistrations) {
    let embedTarget = document.createElement("div");
    this.appendChild(embedTarget);
    this.router = Elm.Host.init({
      node: embedTarget,
      flags: clients
    });

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

  changeRoute(newPath: String) {
    this.router.ports.fromHost.send({
      msgType: "routeChange",
      msg: newPath
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === ROUTE_ATTR && oldValue !== newValue) {
      this.changeRoute(newValue);
    }
  }
}

export default FrameRouterElement;
