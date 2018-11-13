import FrameManager from '../FrameManager';
import { HostRouter, RoutingMap } from '../HostRouter';
import {
  ClientToHost,
  validate as validateIncoming
} from '../messages/ClientToHost';
import { Publication } from '../messages/Publication';
import { SubscriptionManager } from '../SubscriptionManager';

const ROUTE_ATTR = 'route';

/**
 * A DOM element responsible for communicating
 * with the internal {@link ClientFrame} in order
 * to recieve and send messages to and from
 * the client content.
 */
class FrameRouterElement extends HTMLElement {
  private _frameManager: FrameManager;
  private _subscriptionManager: SubscriptionManager;
  private _router: HostRouter;

  constructor() {
    super();
    this._frameManager = new FrameManager({
      onMessage: this._handleClientMessages.bind(this)
    });
    this._subscriptionManager = new SubscriptionManager();
  }

  /**
   * @inheritdoc
   */
  static get observedAttributes() {
    return [ROUTE_ATTR];
  }

  /**
   * @inheritdoc
   */
  public connectedCallback() {
    this.setAttribute('style', 'position: relative;');
    this._frameManager.embed(this);
    this._frameManager.startMessageHandler();
  }

  /**
   * @inheritdoc
   */
  public disconnectedCallback() {
    this._frameManager.stopMessageHandler();
  }

  /**
   * Registers possible clients this frame will host.
   *
   * @param clients The map of registrations for the available clients.
   */
  public registerClients(clients: RoutingMap) {
    this._router = new HostRouter(clients);
    this.changeRoute(this.getAttribute(ROUTE_ATTR) || 'about:blank');
  }

  /**
   * Subscribes to a topic published by the client fragment.
   *
   * @param topic - The topic name the host is interested in.
   */
  public subscribe(topic: string): void {
    this._subscriptionManager.subscribe(topic);
  }

  /**
   * Unsubscribes to a topic published by the client fragment.
   *
   * @param topic - The topic name the host is no longer interested in.
   */
  public unsubscribe(topic: string): void {
    this._subscriptionManager.unsubscribe(topic);
  }

  /**
   * Publish a message to the client fragment.
   *
   * @param publication - The information published to the client fragment.
   * The topic may not be of interest, and could be ignored.
   */
  public publish(publication: Publication): void {
    this._frameManager.sendToClient({
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
    const clientUrl = this._router.getClientUrl(newPath);
    this._frameManager.setFrameLocation(clientUrl);
  }

  /**
   * @inheritdoc
   */
  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    if (name === ROUTE_ATTR && oldValue !== newValue) {
      this.changeRoute(newValue);
    }
  }

  private _handleClientMessages(message: ClientToHost) {
    this.dispatchEvent(
      new CustomEvent(message.msgType, { detail: message.msg })
    );
  }
}

export default FrameRouterElement;
