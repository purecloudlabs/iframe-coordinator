import { Elm, Publication } from '../../elm/Host.elm';
import ClientFrame from './x-ifc-frame';

const ROUTE_ATTR = 'route';

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
  public router: HostProgram;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return [ROUTE_ATTR];
  }

  public connectedCallback() {
    this.setAttribute('style', 'position: relative;');
  }

  public registerClients(clients: ClientRegistrations) {
    const embedTarget = document.createElement('div');
    this.appendChild(embedTarget);
    this.router = Elm.Host.init({
      flags: clients,
      node: embedTarget
    });

    this.router.ports.toHost.subscribe(labeledMsg => {
      this.dispatchEvent(
        new CustomEvent(labeledMsg.msgType, { detail: labeledMsg.msg })
      );
    });

    this.router.ports.toClient.subscribe(message => {
      const frame = this.getElementsByTagName('x-ifc-frame')[0] as ClientFrame;
      if (frame) {
        frame.send(message);
      }
    });
  }

  public subscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msg: topic,
      msgType: 'subscribe'
    });
  }

  public unsubscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msg: topic,
      msgType: 'unsubscribe'
    });
  }

  public publish(publication: Publication): void {
    this.router.ports.fromHost.send({
      msg: publication,
      msgType: 'publish'
    });
  }

  public changeRoute(newPath: string) {
    this.router.ports.fromHost.send({
      msg: newPath,
      msgType: 'routeChange'
    });
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    if (name === ROUTE_ATTR && oldValue !== newValue) {
      this.changeRoute(newValue);
    }
  }
}

export default FrameRouterElement;
