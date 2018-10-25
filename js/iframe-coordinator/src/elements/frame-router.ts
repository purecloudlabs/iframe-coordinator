import { HostProgram, Publication } from '../HostProgram';
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

  public registerClients(clients: {}) {
    const embedTarget = document.createElement('div');
    this.appendChild(embedTarget);
    this.router = new HostProgram({
      flags: clients,
      node: embedTarget
    });

    // Somebody tells us to send a message to the host
    this.router.onMessageToHost((labeledMsg: LabeledMsg) => {
      this.dispatchEvent(
        new CustomEvent(labeledMsg.msgType, { detail: labeledMsg.msg })
      );
    });

    // The host is telling us to send something to the client
    this.router.onSendToClient((labeledMsg: LabeledMsg) => {
      const frame = this.getElementsByTagName('x-ifc-frame')[0] as ClientFrame;
      if (frame) {
        frame.send(labeledMsg);
      }
    });
  }

  // Only dispatch events that we are subscribed for.
  public subscribe(topic: string): void {
    this.router.subscribeToMessages(topic);
  }

  public unsubscribe(topic: string): void {
    this.router.unsubscribeToMessages(topic);
  }

  // Publish a messages down to the client
  public publish(publication: Publication): void {
    this.router.publishGenericMessage({
      msg: publication,
      msgType: 'publish'
    });
  }

  // Changes the route of the client
  public changeRoute(newPath: string) {
    this.router.changeRoute(newPath);
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
