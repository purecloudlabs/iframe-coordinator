/**
 * [[include:client-setup.md]]
 * @module
 */

import { joinRoutes, stripLeadingSlashAndHashTag } from "./urlUtils";
import { EventEmitter, InternalEventEmitter } from "./EventEmitter";
import {
  ClientToHost,
  validate as validateOutgoing,
} from "./messages/ClientToHost";
import {
  HostToClient,
  validate as validateIncoming,
} from "./messages/HostToClient";
import {
  API_PROTOCOL,
  applyClientProtocol,
  PartialMsg,
} from "./messages/LabeledMsg";
import {
  EnvData,
  LabeledEnvInit,
  Lifecycle,
} from "./messages/Lifecycle";
import { ModalRequest } from "./messages/ModalRequest";
import { NavRequest } from "./messages/NavRequest";
import { Notification } from "./messages/Notification";
import { PageMetadata } from "./messages/PageMetadata";
import { Publication } from "./messages/Publication";

/**
 * This class is the central behavior of a micro-frontend client communicating
 * with a host context.
 */
export abstract class AbstractClient<T extends Window | DedicatedWorkerGlobalScope> {
  protected _isStarted: boolean;
  private _environmentData: EnvData;
  private _envDataEmitter: InternalEventEmitter<EnvData>;
  private _publishEmitter: InternalEventEmitter<Publication>;
  private _publishExposedEmitter: EventEmitter<Publication>;
  private _assignedRoute: string | null;
  protected _globalContext: T;
  protected _hostOrigin: string;

  /**
   * Creates a new client.
   */
  public constructor() {
    this._publishEmitter = new InternalEventEmitter<Publication>();
    this._publishExposedEmitter = new EventEmitter<Publication>(
      this._publishEmitter,
    );
    this._envDataEmitter = new InternalEventEmitter<EnvData>();
    this._assignedRoute = null;
  }

  /**
   * Sets up a function that will be called whenever the specified event type is delivered to the target.
   * This should not be confused with the general-purpose pub-sub listeners that can be set via the
   * {@link messaging} interface. Handlers should be set before calling {@link start}, otherwise
   * there is a risk of missing messages between when the host begins delivering data and the listener
   * is added.
   *
   * @param type A case-sensitive string representing the event type to listen for. Currently, hosts only
   * send `environmentalData` events.
   * @param listener The handler which receives a notification when an event of the specified type occurs.
   */
  public addListener(
    type: "environmentalData",
    listener: EnvDataHandler,
  ): this {
    this._envDataEmitter.addListener(type, listener);
    return this;
  }

  /**
   * Removes an event listener previously registered with {@link addListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   * @param listener The event handler to remove from the event target.
   */
  public removeListener(
    type: "environmentalData",
    listener: EnvDataHandler,
  ): this {
    this._envDataEmitter.removeListener(type, listener);
    return this;
  }

  /**
   * Removes all event listeners previously registered with {@link addListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   */
  public removeAllListeners(type: "environmentalData"): this {
    this._envDataEmitter.removeAllListeners(type);
    return this;
  }

  private _onWindowMessage = (event: MessageEvent) => {
    let validated = null;

    // Ignore messages from the wrong origin
    if (this._hostOrigin && event.origin !== this._hostOrigin) {
      return;
    }

    // Ignore messages intended for a Host
    if (event.data && event.data.direction === "ClientToHost") {
      return;
    }

    try {
      validated = validateIncoming(event.data);
    } catch (e) {
      // TODO: We only throw if protocol is set for backward compatibility
      // in 4.0.0 we should drop the event if protocol is not set.
      if (event.data.protocol === API_PROTOCOL) {
        throw new Error(
          `
  I received an invalid message from the host application. This is probably due
  to a major version mismatch between client and host iframe-coordinator libraries.
        `.trim() +
            "\n" +
            e.message,
        );
      } else {
        return;
      }
    }

    this._handleHostMessage(validated);
  };

  private _handleEnvironmentData(message: HostToClient): void {
    const envInitMsg: LabeledEnvInit = message as LabeledEnvInit;
    const { assignedRoute, ...envData } = envInitMsg.msg;
    this._assignedRoute = assignedRoute;
    this._environmentData = envData;

    // Extension point for specific derived class behavior
    this._onEnvironmentData(envData);

    this._envDataEmitter.dispatch("environmentalData", this._environmentData);
  }

  /**
   * Allows for specific client actions on environment data
   * @param envData
   */
  protected abstract _onEnvironmentData(envData: EnvData): void;

  private _handleHostMessage(message: HostToClient): void {
    switch (message.msgType) {
      case "publish":
        const publication: Publication = message.msg;
        this._publishEmitter.dispatch(message.msg.topic, publication);
        break;
      case "env_init":
        this._handleEnvironmentData(message);
        return;
      default:
      // Only emit events which are specifically handled
    }
  }

  /**
   * Gets the environmental data provided by the host application. This includes
   * the locale the client should use, the base URL of the host app, and any
   * custom data sent by the host.
   */
  public get environmentData() {
    return this._environmentData;
  }

  /**
   * Translates a client route like `/foo/bar` to the full URL used in the host
   * app for the same page, e.g. `https://hostapp.com/#/client-app/foo/bar`.
   * You should use this whenever generating an internal link within a client
   * application so that the user gets a nice experience if they open a link in
   * a new tab, or copy and paste a link URL into a chat message or email.
   *
   * @param clientRoute The /-separated path within the client app to link to.
   */
  public urlFromClientPath(clientRoute: string): string {
    const hostRootUrl = this.environmentData.hostRootUrl;
    const assignedRoute = this._assignedRoute || "";
    const trimmedClientRoute = stripLeadingSlashAndHashTag(clientRoute);
    return joinRoutes(hostRootUrl, assignedRoute, trimmedClientRoute);
  }

  /**
   * Translates a host route like `/app2` to the full URL used in the host
   * app, e.g. `https://hostapp.com/#/app2`.
   * You should use this whenever generating a host link within a client
   * application so that the user gets a nice experience if they open a link in
   * a new tab, or copy and paste a link URL into a chat message or email.
   *
   * @param hostRoute The /-separated path within the host app to link to.
   */
  public urlFromHostPath(hostRoute: string): string {
    const hostRootUrl = this.environmentData.hostRootUrl;
    const trimmedHostRoute = stripLeadingSlashAndHashTag(hostRoute);
    return joinRoutes(hostRootUrl, trimmedHostRoute);
  }

  /**
   * Translates a client route like `/foo/bar` to the full URL used in the host
   * app for the same page, e.g. `https://hostapp.com/#/client-app/foo/bar`.
   *
   * @param clientRouteLegacy The /-separated path within the client app to link to.
   *
   * @deprecated Use the new {@link urlFromClientPath} method instead
   */
  public asHostUrl(clientRouteLegacy: string): string {
    const trimmedClientRoute = stripLeadingSlashAndHashTag(clientRouteLegacy);
    return joinRoutes(
      this.environmentData.hostRootUrl,
      this._assignedRoute || "",
      trimmedClientRoute,
    );
  }

  protected _sendToHost<T, V>(partialMsg: PartialMsg<T, V>): void {
    const message = applyClientProtocol(partialMsg);

    let validated: ClientToHost;

    try {
      validated = validateOutgoing(message);
    } catch (e) {
      throw new Error(
        `
I received invalid data to send to the host application. This is probably due to
bad input into one of the iframe-coordinator client methods.
      `.trim() +
          "\n" +
          e.message,
      );
    }

    this._postMessage(validated);
  }

  /*
   * Client-specific method for delivering a validated payload to the host
   * application. This needs to be different across iframes and workers because
   * iframes care about the parent frame origin, and workers do not.
   */
  protected abstract _postMessage(message: ClientToHost): void;

  /**
   * Initiates responding to events triggered by the host application.
   */
  public start(): void {
    if (this._isStarted) {
      return;
    }

    this._isStarted = true;

    this._globalContext.addEventListener("message", this._onWindowMessage);
    this._sendToHost(Lifecycle.startedMessage);
  }

  /**
   * Accessor for the general-purpose pub-sub bus between client and host applications.
   * The content of messages on this bus are not defined by this API beyond a basic
   * data wrapper of topic and payload. This is for application-specific messages
   * agreed upon as a shared API between host and client.
   */
  public get messaging(): EventEmitter<Publication> {
    return this._publishExposedEmitter;
  }

  /**
   * Disconnects this client from the host application. This is mostly provided for
   * the sake of API completeness. It's unlikely to be used by most applications.
   */
  public stop(): void {
    if (!this._isStarted) {
      return;
    }

    this._isStarted = false;
    this._globalContext.removeEventListener("message", this._onWindowMessage);
  }

  /**
   * Publish a general message to the host application.
   *
   * @param publication The data object to be published.
   */
  public publish(publication: Publication): void {
    this._sendToHost({
      msgType: "publish",
      msg: publication,
    });
  }

  /**
   * Asks the host application to open a modal dialog.
   *
   * The modalId property names the modal that should be displayed
   * Data passed via the modalData property can be used by the host application to set up initial state specific to that modal
   *
   * @param modalRequest the ID and any data specific to the modal instance required
   *
   */
  public requestModal(modalRequest: ModalRequest) {
    this._sendToHost({
      msgType: "modalRequest",
      msg: modalRequest,
    });
  }

  /**
   * Asks the host application to display a user notification.
   *
   * The page embedding the client app is responsible for handling the fired custom event and
   * presenting/styling the notification.  Application-specific concerns such as level, TTLs,
   * ids for action callbacks (notification click, notification action buttons), etc. can be passed via
   * the `custom` property of the `notification` type.
   *
   * @param notification the desired notification configuration.
   *
   * @example
   * ```typescript
   * client.requestNotification({ title: 'Hello world' });
   * ```
   *
   * @example
   * ```typescript
   * client.requestNotification({
   *   title: 'Hello',
   *   message: 'World'
   * });
   * ```
   *
   * @example
   * ```typescript
   * client.requestNotification({
   *   title: 'Hello',
   *   message: 'World',
   *   custom: {
   *     displaySeconds: 5,
   *     level: 'info'
   *   }
   * });
   * ```
   */
  public requestNotification(notification: Notification): void {
    this._sendToHost({
      msgType: "notifyRequest",
      msg: notification,
    });
  }

  /**
   * Asks the host application to navigate to a new location.
   *
   * By requesting navigation from the host app instead of navigating directly in the client frame,
   * a host-client pair can maintain a consistent browser history even if the client frame is removed
   * from the page in some situations. It also helps avoid any corner-case differences in how older
   * browsers handle iframe history
   *
   * @param destination a description of where the client wants to navigate the app to.
   *
   */
  public requestNavigation(destination: NavRequest): void {
    this._sendToHost({
      msgType: "navRequest",
      msg: destination,
    });
  }

  /**
   * Asks the host application to display a prompt on leave dialog.
   */
  public requestPromptOnLeave(messagePrompt?: string): void {
    this._sendToHost({
      msgType: "promptOnLeave",
      msg: { shouldPrompt: true, message: messagePrompt },
    });
  }

  /**
   * Asks the host application to clear the prompt on leave dialog.
   */
  public clearPromptOnLeave(): void {
    this._sendToHost({
      msgType: "promptOnLeave",
      msg: { shouldPrompt: false },
    });
  }

  /**
   * Sends page metadata to host for display and browser settings
   *
   * title property is for the page title in the browser
   * breadcrumbs is an array of breadcrumb data for display in host application
   * custom is any custom data wanting to be sent by client app
   *
   * @param metadata data that will be used for display in host application and browser page title
   */
  public sendPageMetadata(metadata: PageMetadata): void {
    this._sendToHost({
      msgType: "pageMetadata",
      msg: metadata,
    });
  }
}

export type EnvDataHandler = (envData: EnvData) => void;
