import { EventEmitter, InternalEventEmitter } from './EventEmitter';
import {
  ClientToHost,
  validate as validateOutgoing
} from './messages/ClientToHost';
import {
  HostToClient,
  validate as validateIncoming
} from './messages/HostToClient';
import {
  EnvData,
  EnvDataHandler,
  LabeledEnvInit,
  Lifecycle
} from './messages/Lifecycle';
import { Publication } from './messages/Publication';
import { Toast } from './messages/Toast';

/**
 * Configuration options given to the client
 * from the host application.
 * @external
 */
interface ClientConfigOptions {
  clientWindow?: Window;
}

/**
 * The Client is access point for the embedded UI's in the host application.
 */
export class Client {
  private _isStarted: boolean;
  private _clientWindow: Window;
  private _environmentData: EnvData;
  private _envDataEmitter: InternalEventEmitter<EnvData>;
  private _publishEmitter: InternalEventEmitter<Publication>;
  private _publishExposedEmitter: EventEmitter<Publication>;

  public constructor(configOptions: ClientConfigOptions = {}) {
    this._clientWindow = configOptions.clientWindow || window;
    this._publishEmitter = new InternalEventEmitter<Publication>();
    this._publishExposedEmitter = new EventEmitter<Publication>(
      this._publishEmitter
    );
    this._envDataEmitter = new InternalEventEmitter<EnvData>();
  }

  /**
   * Sets up a function that will be called whenever the specified event type is delivered to the target.
   * @param type A case-sensitive string representing the event type to listen for.
   * @param listener The handler which receives a notification when an event of the specified type occurs.
   */
  public addListener(
    type: 'environmentalData',
    listener: EnvDataHandler
  ): Client {
    this._envDataEmitter.addListener(type, listener);
    return this;
  }

  /**
   * Removes from the event listener previously registered with {@link InternalEventEmitter.addEventListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   * @param listener The event handler to remove from the event target.
   */
  public removeListener(
    type: 'environmentalData',
    listener: EnvDataHandler
  ): Client {
    this._envDataEmitter.removeListener(type, listener);
    return this;
  }

  /**
   * Removes all event listeners previously registered with {@link InternalEventEmitter.addEventListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   */
  public removeAllListeners(type: 'environmentalData'): Client {
    this._envDataEmitter.removeAllListeners(type);
    return this;
  }

  private _onWindowMessage = (event: MessageEvent) => {
    const validated = validateIncoming(event.data);
    if (validated) {
      this._handleHostMessage(validated);
    }
  };

  private _onWindowClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a' && event.button === 0) {
      event.preventDefault();
      const a = event.target as HTMLAnchorElement;
      const url = new URL(a.href);
      this._sendToHost({
        msgType: 'navRequest',
        msg: {
          url: url.toString()
        }
      });
    }
  };

  private _handleHostMessage(message: HostToClient): void {
    switch (message.msgType) {
      case 'publish':
        this._publishEmitter.dispatch(message.msg.topic, message.msg);
        break;
      case 'env_init':
        const envInitMsg: LabeledEnvInit = message as LabeledEnvInit;
        this._environmentData = envInitMsg.msg;
        this._envDataEmitter.dispatch(
          'environmentalData',
          this._environmentData
        );
        return;
      default:
      // Only emit events which are specifically handeled
    }
  }

  /**
   * Gets the current environmental data provided
   * by the host application.
   */
  public get environmentData() {
    return this._environmentData;
  }

  private _sendToHost(message: ClientToHost): void {
    const validated = validateOutgoing(message);
    if (validated) {
      this._clientWindow.parent.postMessage(validated, '*');
    }
  }

  /**
   * Initiates responding to events triggered by the host application.
   */
  public start(): void {
    if (this._isStarted) {
      return;
    }

    this._isStarted = true;

    this._clientWindow.addEventListener('message', this._onWindowMessage);
    this._clientWindow.addEventListener('click', this._onWindowClick);
    this._sendToHost(Lifecycle.startedMessage);
  }

  /**
   * Eventing for published messages from the host application.
   */
  public get messaging(): EventEmitter<Publication> {
    return this._publishExposedEmitter;
  }

  /**
   * Deactivates responding to events triggered by the host application.
   */
  public stop(): void {
    if (!this._isStarted) {
      return;
    }

    this._isStarted = false;
    this._clientWindow.removeEventListener('message', this._onWindowMessage);
    this._clientWindow.removeEventListener('click', this._onWindowClick);
  }

  /**
   * Publish a general message to the host application.
   *
   * @param publication The data object to be published.
   */
  public publish(publication: Publication): void {
    this._sendToHost({
      msgType: 'publish',
      msg: publication
    });
  }

  /**
   * Request a toast message be displayed by the host.
   *
   * The page embedding the host is responsible for handling the fired custom event and
   * presenting/styling the toast.  Application-specific concerns such as level, TTLs,
   * ids for action callbacks (toast click, toast action buttons), etc. can be passed via an object
   * as the custom property of the options param.
   *
   * @param toast the desired toast configuration.
   *
   * @example
   * worker.requestToast({ title: 'Hello world' });
   *
   * @example
   * worker.requestToast({ title: 'Hello', message: 'World' });
   *
   * @example
   * worker.requestToast({ title: 'Hello', message: 'World', custom: { ttl: 5, level: 'info' } });
   */
  public requestToast(toast: Toast) {
    this._sendToHost({
      msgType: 'toastRequest',
      msg: toast
    });
  }
}
