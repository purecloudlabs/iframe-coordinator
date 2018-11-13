import FrameManager from '../FrameManager';
import { HostRouter, RoutingMap } from '../HostRouter';
import { ClientToHost } from '../messages/ClientToHost';
import { EnvData, Lifecycle, LifecycleStage } from '../messages/Lifecycle';
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
  private _envData: EnvData;

  constructor() {
    super();
    this._frameManager = new FrameManager({
      onMessage: this._handleClientMessage.bind(this)
    });
    this._subscriptionManager = new SubscriptionManager();
    this._subscriptionManager.setHandler((publication: Publication) => {
      this._dispatchClientMessag({
        msgType: 'publish',
        msg: publication
      });
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
   * Set the environment data from the host to pass to each client.
   *
   * @param envData Information about the host environment.
   */
  public setEnvData(envData: EnvData) {
    this._envData = envData;
    this._frameManager.sendToClient(Lifecycle.genEnvInitMessage(this._envData));
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

  private _handleClientMessage(message: ClientToHost): void {
    switch (message.msgType) {
      case 'publish':
        this._subscriptionManager.dispatchMessage(message.msg);
        break;
      case 'lifecycle':
        this._handleLifecycleMessage(message.msg as LifecycleStage);
        break;
      default:
        this._dispatchClientMessag(message);
    }
  }

  private _handleLifecycleMessage(message: LifecycleStage) {
    if (Lifecycle.isStartedStage(message)) {
      this._frameManager.sendToClient(
        Lifecycle.genEnvInitMessage(this._envData)
      );
    }
  }

  private _dispatchClientMessag(message: ClientToHost) {
    this.dispatchEvent(
      new CustomEvent(message.msgType, { detail: message.msg })
    );
  }
}

export default FrameRouterElement;
