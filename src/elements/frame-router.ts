import FrameManager from '../FrameManager';
import { HostRouter, RoutingMap } from '../HostRouter';
import { ClientToHost } from '../messages/ClientToHost';
import { EnvData, LabeledStarted, Lifecycle } from '../messages/Lifecycle';
import { Publication } from '../messages/Publication';
import { SubscriptionManager } from '../SubscriptionManager';

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

  public setEnvData(envData: EnvData) {
    this.router.setEnvData(envData);
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

  /**
   * Set the environment data from the host to pass to each client.
   *
   * @param envData Information about the host environment.
   */
  public setEnvData(envData: EnvData) {
    this._envData = envData;
    this._frameManager.sendToClient({
      msgType: 'env_init',
      msg: envData
    });
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
      case 'client_started':
        this._handleLifecycleMessage(message);
        break;
      default:
        this._dispatchClientMessag(message);
    }
  }

  private _handleLifecycleMessage(message: LabeledStarted) {
    this._frameManager.sendToClient({
      msgType: 'env_init',
      msg: this._envData
    });
  }

  private _dispatchClientMessag(message: ClientToHost) {
    this.dispatchEvent(
      new CustomEvent(message.msgType, { detail: message.msg })
    );
  }
}

export default FrameRouterElement;
