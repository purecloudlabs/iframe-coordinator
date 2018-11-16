import { EventEmitter, ExposedEventEmitter } from '../EventEmitter';
import FrameManager from '../FrameManager';
import { HostRouter, RoutingMap } from '../HostRouter';
import { ClientToHost } from '../messages/ClientToHost';
import { Publication } from '../messages/Publication';

const ROUTE_ATTR = 'route';

/**
 * A DOM element responsible for communicating
 * with the internal {@link ClientFrame} in order
 * to recieve and send messages to and from
 * the client content.
 */
class FrameRouterElement extends HTMLElement {
  private _frameManager: FrameManager;
  private _router: HostRouter;
  private _publishEmitter: EventEmitter<Publication>;
  private _publishExposedEmitter: ExposedEventEmitter<Publication>;

  constructor() {
    super();
    this._publishEmitter = new EventEmitter<Publication>();
    this._publishExposedEmitter = new ExposedEventEmitter<Publication>(
      this._publishEmitter
    );

    this._frameManager = new FrameManager({
      onMessage: this._handleClientMessages.bind(this)
    });
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
   * Eventing for published messages from the host application.
   */
  public get messaging() {
    return this._publishExposedEmitter;
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
    switch (message.msgType) {
      case 'publish':
        this._publishEmitter.dispatch(message.msg.topic, message.msg);
        break;
      default:
        this._dispatchClientMessage(message);
    }
  }

  private _dispatchClientMessage(message: ClientToHost) {
    this.dispatchEvent(
      new CustomEvent(message.msgType, { detail: message.msg })
    );
  }
}

export default FrameRouterElement;
