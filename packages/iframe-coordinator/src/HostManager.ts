import { EventEmitter, InternalEventEmitter } from "./EventEmitter";
import {
  HostToClient,
  validate as validateHostToClient,
} from "./messages/HostToClient";
import {
  ClientToHost,
  validate as validateClientToHost,
} from "./messages/ClientToHost";
import {
  applyHostProtocol,
  API_PROTOCOL,
  PartialMsg,
} from "./messages/LabeledMsg";
import { EnvData, LabeledStarted, SetupData } from "./messages/Lifecycle";
import { Publication } from "./messages/Publication";

export abstract class HostManager {
  private envData: EnvData;
  /**
   * The internal event emitter that we privately dispatch events on.
   */
  private _publishEmitter: InternalEventEmitter<Publication> =
    new InternalEventEmitter<Publication>();
  /**
   * The exposed public event emitter that only supports subscribing, not dispatch.
   */
  public publishEmitter: EventEmitter<Publication>;

  /**
   * For the frame router host, this is the frame-router element.
   * For web workers, it is the workerPool, which extends EventTarget.
   */
  private _ifcEventTarget: EventTarget;

  constructor(envData: EnvData, eventTarget: EventTarget) {
    this.envData = envData;
    this._ifcEventTarget = eventTarget;
    this.publishEmitter = new EventEmitter<Publication>(this._publishEmitter);
  }

  public handleClientMessage(event: MessageEvent, clientId: string) {
    const message = this._validateClientMessage(event, clientId);
    if (message === undefined) {
      return;
    }

    switch (message.msgType) {
      case "publish":
        const publication: Publication = message.msg;
        publication.clientId = clientId;
        this._publishEmitter.dispatch(message.msg.topic, publication);
        this._emitClientEvent(message, clientId);
        break;
      case "client_started":
        this._handleLifecycleMessage(message, clientId);
        break;
      default:
        this._emitClientEvent(message, clientId);
    }
  }

  private _validateClientMessage(
    event: MessageEvent<ClientToHost>,
    clientId: string
  ): ClientToHost | undefined {
    let validated: ClientToHost;

    if (event.data && event.data.direction === "HostToClient") {
      return;
    }

    const expectedClientOrigin = this._expectedClientOrigin(clientId);
    if (event.origin !== expectedClientOrigin) {
      console.warn(`Ignoring message from unexpected origin: ${event.origin}`, event.data);
      return;
    }

    try {
      validated = validateClientToHost(event.data);
    } catch (e) {
      if (event.data.protocol == API_PROTOCOL) {
        throw new Error(
          `
    I received an invalid message from the client application. This is probably due
    to a major version mismatch between client and host iframe-coordinator libraries.
          `.trim() +
            "\n" +
            e.message,
        );
      } else {
        return;
      }
    }

    return validated;
  }

  private _handleLifecycleMessage(_message: LabeledStarted, clientId: string) {
    const assignedRoute = this._getClientAssignedRoute(clientId);
    const envData: SetupData = {
      ...this.envData,
      assignedRoute,
    };
    this.sendToClient(
      {
        msgType: "env_init",
        msg: envData,
      },
      clientId,
    );
  }

  /**
   * Sends a message to a client after validating it and adding ifc protocol
   * metadata. The message will not be sent if it is not valid.
   *
   * @param message The message to send.
   */
  public sendToClient<T, V>(partialMsg: PartialMsg<T, V>, clientId: string) {
    const message = applyHostProtocol(partialMsg);
    let validated: HostToClient;

    try {
      validated = validateHostToClient(message);
    } catch (e) {
      throw new Error(
        `
  I received invalid data to send to a client application. This is probably due
  to bad data passed from the host application.
  `.trim() +
          "\n" +
          e.message,
      );
    }

    this._postMessageToClient(validated, clientId);
  }

  /**
   * Emits an event received from a client to the host application via the event
   * target for this host manager.
   * @param message The ClientToHost message to pass along to the host application
   * @param clientId The identifier of the client the message originated from
   */
  protected _emitClientEvent(message: ClientToHost, clientId: string): void {
    const messageDetail: any = message.msg;
    messageDetail.clientId = clientId;

    this._ifcEventTarget.dispatchEvent(
      new CustomEvent(message.msgType, { detail: messageDetail }),
    );
  }

  /**
   * Returns the expected event origin for messages associated with the given
   * client identifier.
   */
  protected abstract _expectedClientOrigin(clientId: String): string;

  /**
   * Implementation for sending a message to a specific client.
   */
  protected abstract _postMessageToClient(
    message: HostToClient,
    clientId: string,
  ): void;

  /**
   * Gets the URL route assigned to a specific client
   */
  protected abstract _getClientAssignedRoute(clientId: string): string;
}
