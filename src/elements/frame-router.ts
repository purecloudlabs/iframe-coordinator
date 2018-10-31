import { HostRouter, RoutingMap } from '../HostRouter';
import { Publication } from '../messages/Publication';
import { SubscriptionManager } from '../SubscriptionManager';
import IframeManager from './IframeManager';

const ROUTE_ATTR = 'route';

/**
 * A DOM element responsible for communicating
 * with the internal {@link ClientFrame} in order
 * to recieve and send messages to and from
 * the client content.
 */
class FrameRouterElement extends HTMLElement {
  private _frameManager: IframeManager;
  private _subscriptionManager: SubscriptionManager;
  public router: HostRouter;

  constructor() {
    super();
    this._frameManager = new IframeManager();
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
    // TODO: subscribe to winodow message events and add handler.
  }

  /**
   * Registers possible clients this frame will host.
   *
   * @param clients The map of registrations for the available clients.
   */
  public registerClients(clients: RoutingMap) {
    this.router = new HostRouter(clients);
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
    this._frameManager.sendtoClient({
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
    const clientUrl = this.router.getClientUrl(newPath);
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
}

export default FrameRouterElement;
