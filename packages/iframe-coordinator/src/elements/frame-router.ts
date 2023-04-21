import { EventEmitter, InternalEventEmitter } from '../EventEmitter';
import FrameManager from '../FrameManager';
import { HostRouter, RoutingMap } from '../HostRouter';
import { ClientToHost } from '../messages/ClientToHost';
import { EnvData, LabeledStarted, SetupData } from '../messages/Lifecycle';
import { Publication } from '../messages/Publication';
import { stripTrailingSlash } from '../urlUtils';

const ROUTE_ATTR = 'route';

/** A property that can be set to initialize the host frame with the
 * possible clients and the environmental data required by the clients
 */
interface ClientConfig {
  /** The map of registrations for the available clients. */
  clients: RoutingMap;
  /** Information about the host environment. */
  envData: EnvData;
}

/**
 * A custom element responsible for rendering an iframe and communicating with
 * configured client applications that will render in that frame. It will be
 * registered as `frame-router` by a call to [[registerCustomElements]] and
 * should not be created directly. Instead, add a `<frame-router>` element to your
 * markup or use `document.createElement('frame-router')` after calling
 * [[registerCustomElements]].
 */
export default class FrameRouterElement extends HTMLElement {
  private _frameManager: FrameManager;
  private _router: HostRouter;
  private _envData: EnvData;
  private _publishEmitter: InternalEventEmitter<Publication>;
  private _publishExposedEmitter: EventEmitter<Publication>;
  private _currentClientId: string;
  private _currentPath: string;

  /** @internal */
  constructor() {
    super();
    this._publishEmitter = new InternalEventEmitter<Publication>();
    this._publishExposedEmitter = new EventEmitter<Publication>(
      this._publishEmitter
    );

    this._frameManager = new FrameManager({
      onMessage: this._handleClientMessages.bind(this)
    });
  }

  /**
   * @internal
   * @inheritdoc
   */
  static get observedAttributes() {
    return [ROUTE_ATTR];
  }

  /**
   * @internal
   * @inheritdoc
   */
  public connectedCallback() {
    this._frameManager.embed(this);
    this._frameManager.startMessageHandler();
  }

  /**
   * @internal
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
   *
   * @deprecated Use the new {@clientConfig} property instead
   *
   */
  public setupFrames(clients: RoutingMap, envData: EnvData) {
    this._router = new HostRouter(clients);
    const processedHostUrl = this._processHostUrl(envData.hostRootUrl);
    this._envData = {
      ...envData,
      hostRootUrl: processedHostUrl
    };
    this._clientConfig = { clients, envData };
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
      const newClientId = (clientInfo && clientInfo.id) || '';

      if (this._currentClientId !== newClientId) {
        this.dispatchEvent(
          new CustomEvent('clientChanged', { detail: newClientId })
        );
      }

      if (clientInfo === null && this._currentPath !== newPath) {
        /**
         * Emit a clientNotFound event when there is no matching client.
         * As a legacy behavior, a clientChanged event will also fire unless the
         * _currentClientId was already an empty string.
         */
        this.dispatchEvent(new CustomEvent('clientNotFound'));
      }

      this._currentPath = newPath;
      this._currentClientId = newClientId;

      const newLocation = this._frameManager.setFrameLocation(
        clientInfo && clientInfo.url
      );

      this._frameManager.setFrameSandbox(
        (clientInfo && clientInfo.sandbox) || undefined
      );
      this._frameManager.setFrameAllow(
        (clientInfo && clientInfo.allow) || undefined
      );
      this._frameManager.setFrameDefaultTitle(
        (clientInfo && clientInfo.defaultTitle) || undefined
      );

      this.dispatchEvent(
        new CustomEvent('frameTransition', { detail: newLocation })
      );
    }
  }

  /**
   * @internal
   * @inheritdoc
   */
  public attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === ROUTE_ATTR && oldValue !== newValue) {
      this.changeRoute(newValue || '');
    }
  }

  private _clientConfig: ClientConfig;

  /**
   * A property that can be set to initialize the host frame
   */
  get clientConfig(): ClientConfig {
    return this._clientConfig;
  }

  set clientConfig(clientConfig: ClientConfig) {
    this._clientConfig = clientConfig;
    this._configureClients(clientConfig.clients, clientConfig.envData);
  }

  private _configureClients(clients: RoutingMap, envData: EnvData) {
    this._router = new HostRouter(clients);
    const processedHostUrl = this._processHostUrl(envData.hostRootUrl);
    this._envData = {
      ...envData,
      hostRootUrl: processedHostUrl
    };

    this.changeRoute(this.getAttribute(ROUTE_ATTR) || 'about:blank');
  }

  private _handleClientMessages(message: ClientToHost) {
    switch (message.msgType) {
      case 'publish':
        const publication: Publication = message.msg;
        publication.clientId = this._currentClientId;
        this._publishEmitter.dispatch(message.msg.topic, publication);
        this._dispatchClientMessage(message);
        break;
      case 'client_started':
        this._handleLifecycleMessage(message);
        break;
      default:
        this._dispatchClientMessage(message);
    }
  }

  private _handleLifecycleMessage(message: LabeledStarted) {
    const assignedRoute = this._getCurrentClientAssignedRoute();
    const envData: SetupData = {
      ...this._envData,
      assignedRoute
    };
    this._frameManager.sendToClient({
      msgType: 'env_init',
      msg: envData
    });
  }

  private _dispatchClientMessage(message: ClientToHost) {
    const messageDetail: any = message.msg;
    messageDetail.clientId = this._currentClientId;

    this.dispatchEvent(
      new CustomEvent(message.msgType, { detail: messageDetail })
    );
  }

  private _getCurrentClientAssignedRoute() {
    const currentRoutePath = this.getAttribute(ROUTE_ATTR) || '';
    const clientInfo = this._router.getClientTarget(currentRoutePath);
    return (clientInfo && clientInfo.assignedRoute) || '';
  }

  private _processHostUrl(hostUrl: string) {
    const hostUrlObject = new URL(hostUrl);
    if (hostUrlObject.hash) {
      return hostUrlObject.href;
    }
    const trimmedUrl = stripTrailingSlash(hostUrl);
    return window.location.hash ? `${trimmedUrl}/#` : trimmedUrl;
  }
}
