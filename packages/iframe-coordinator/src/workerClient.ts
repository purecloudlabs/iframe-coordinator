import { joinRoutes, stripLeadingSlashAndHashTag } from "../src/urlUtils";
import { EnvData, EnvDataHandler, Lifecycle } from "./messages/Lifecycle";
import { EventEmitter, InternalEventEmitter } from "./EventEmitter";
import { applyClientProtocol, PartialMsg } from "./messages/LabeledMsg";
import {
  ClientToHost,
  validate as validateOutgoing,
} from "./messages/ClientToHost";


import { ModalRequest } from "./messages/ModalRequest";
import { NavRequest } from "./messages/NavRequest";
import { Notification } from "./messages/Notification";
import { PageMetadata } from "./messages/PageMetadata";
import { PromptOnLeave } from "./messages/PromptOnLeave";
import { Publication } from "./messages/Publication";

// Re-exports for doc visibility
export {
    EventEmitter,
    EnvData,
    Publication,
    EnvDataHandler,
    ModalRequest,
    NavRequest,
    Notification,
    PromptOnLeave,
  };

/**
 * Client configuration options.
 */
export interface WorkerClientConfigOptions {
    /** The expected origin of the host application. Messages will not be sent to other origins. */
    hostOrigin?: string;
  }

export class WorkerClient {
  private _isStarted: boolean;
  private _clientWindow: Window;
  private _environmentData: EnvData;
  private _envDataEmitter: InternalEventEmitter<EnvData>;
  private _publishExposedEmitter: EventEmitter<Publication>;
  private _assignedRoute: string | null;
  private _hostOrigin: string;


    /**
   * Creates a new client.
   */
    public constructor(configOptions?: WorkerClientConfigOptions) {
        if (configOptions && configOptions.hostOrigin) {
          this._hostOrigin = configOptions.hostOrigin;
        } else {
          this._hostOrigin = window.origin;
        }
        this._clientWindow = window;
        this._envDataEmitter = new InternalEventEmitter<EnvData>();
        this._assignedRoute = null;
      }

  /**
   * Sets up a function that will be called whenever the specified event type is delivered to the target.
   * This should not be confused with the general-purpose pub-sub listeners that can be set via the
   * {@link WorkerClient.messaging | messaging} interface.
   *
   * @param type A case-sensitive string representing the event type to listen for. Currently, hosts only
   * send `environmentalData` events.
   * @param listener The handler which receives a notification when an event of the specified type occurs.
   */
  public addListener(
    type: "environmentalData",
    listener: EnvDataHandler,
  ): WorkerClient {
    this._envDataEmitter.addListener(type, listener);
    return this;
  }

  /**
   * Removes an event listener previously registered with {@link WorkerClient.addListener | addListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   * @param listener The event handler to remove from the event target.
   */
  public removeListener(
    type: "environmentalData",
    listener: EnvDataHandler,
  ): WorkerClient {
    this._envDataEmitter.removeListener(type, listener);
    return this;
  }

  /**
   * Removes all event listeners previously registered with {@link WorkerClient.addListener | addListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   */
  public removeAllListeners(type: "environmentalData"): WorkerClient {
    this._envDataEmitter.removeAllListeners(type);
    return this;
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

  private _sendToHost<T, V>(partialMsg: PartialMsg<T, V>): void {
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

    this._clientWindow.parent.postMessage(validated, this._hostOrigin);
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
   * Initiates responding to events triggered by the host application.
   */
  public start(): void {
    if (this._isStarted) {
      return;
    }

    this._isStarted = true;
    this._sendToHost(Lifecycle.startedMessage);
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
   * Gets the environmental data provided by the host application. This includes
   * the locale the client should use, the base URL of the host app, and any
   * custom data sent by the host.
   */
  public get environmentData() {
    return this._environmentData;
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

  public requestNotification(notification: Notification): void {
    this._sendToHost({
      msgType: "notifyRequest",
      msg: notification,
    });
  }
}
