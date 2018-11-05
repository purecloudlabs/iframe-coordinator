import { HostRouter, Publication } from '../HostRouter';
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
  public router: HostRouter;

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
    this.router = new HostRouter({
      routingMap: clients,
      node: embedTarget
    });

    // Router requests a message sent to the host.
    this.router.onSendToHost((labeledMsg: LabeledMsg) => {
      this.dispatchEvent(
        new CustomEvent(labeledMsg.msgType, { detail: labeledMsg.msg })
      );
    });
  }

  /**
   * Subscribes to a topic published by the client fragment.
   *
   * @param topic - The topic name the host is interested in.
   */
  public subscribe(topic: string): void {
    this.router.subscribeToMessages(topic);
  }

  /**
   * Unsubscribes to a topic published by the client fragment.
   *
   * @param topic - The topic name the host is no longer interested in.
   */
  public unsubscribe(topic: string): void {
    this.router.unsubscribeToMessages(topic);
  }

  /**
   * Publish a message to the client fragment.
   *
   * @param publication - The information published to the client fragment.
   * The topic may not be of interest, and could be ignored.
   */
  public publish(publication: Publication): void {
    this.router.publishGenericMessage({
      msg: publication,
      msgType: 'publish'
    });
  }

  /**
   * Changes the route the client fragment is rendering.
   *
   * @param newPath a new route which matches those provided originally.
   */
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
