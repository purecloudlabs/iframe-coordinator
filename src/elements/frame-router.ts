import { EventEmitter, InternalEventEmitter } from '../EventEmitter';
import { Filter } from '../filtering/Filter';
import FrameManager from '../FrameManager';
import { HostRouter, RoutingMap } from '../HostRouter';
import { ClientToHost } from '../messages/ClientToHost';
import { EnvData, LabeledStarted } from '../messages/Lifecycle';
import { Publication } from '../messages/Publication';

/** @external */
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
  private _envData: EnvData;
  private _publishEmitter: InternalEventEmitter<Publication>;
  private _publishExposedEmitter: EventEmitter<Publication>;
  private _currentClientId: string;
  private _filteredTopics: Map<string, Filter>;

  constructor() {
    super();
    this._publishEmitter = new InternalEventEmitter<Publication>();
    this._publishExposedEmitter = new EventEmitter<Publication>(
      this._publishEmitter
    );

    this._frameManager = new FrameManager({
      onMessage: this._handleClientMessages.bind(this)
    });

    this._filteredTopics = new Map();
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
   * Initializes this host frame with the possible clients and
   * the environmental data required the clients.
   *
   * @param clients The map of registrations for the available clients.
   * @param envData Information about the host environment.
   */
  public setupFrames(clients: RoutingMap, envData: EnvData) {
    this._router = new HostRouter(clients);
    this._envData = envData;

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
    if (this._router) {
      const clientInfo = this._router.getClientTarget(newPath);
      this._currentClientId = (clientInfo && clientInfo.id) || '';

      this._filteredTopics =
        (clientInfo && clientInfo.filteredTopics) || new Map();
      this._envData.filteredTopics = this._filteredTopics;

      const newLocation = this._frameManager.setFrameLocation(
        clientInfo && clientInfo.url
      );
      this.dispatchEvent(
        new CustomEvent('frameTransition', { detail: newLocation })
      );
    }
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
        const publication: Publication = message.msg;
        publication.clientId = this._currentClientId;
        this._publishEmitter.dispatch(message.msg.topic, publication);
        break;
      case 'client_started':
        this._handleLifecycleMessage(message);
        break;
      default:
        this._dispatchClientMessage(message);
    }
  }

  private _handleLifecycleMessage(message: LabeledStarted) {
    this._frameManager.sendToClient({
      msgType: 'env_init',
      msg: this._envData
    });
  }

  private _dispatchClientMessage(message: ClientToHost) {
    const messageDetail: any = message.msg;
    messageDetail.clientId = this._currentClientId;

    this.dispatchEvent(
      new CustomEvent(message.msgType, { detail: messageDetail })
    );
  }
}

export default FrameRouterElement;
