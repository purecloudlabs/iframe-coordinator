import { EventEmitter, InternalEventEmitter } from './EventEmitter';
import { Filter, inFilter } from './filtering/Filter';
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
import { transformKeyEvent } from './transformers/KeyboardEventTransformer';
/**
 * Client configuration options.
 */
interface ClientConfigOptions {
  /** The expected origin of the host application. Messages will not be sent to other origins. */
  hostOrigin?: string;
}

/**
 * This class is the primary interface that an embedded iframe client should use to communicate with
 * the host application.
 */
export class Client {
  private _isStarted: boolean;
  private _clientWindow: Window;
  private _environmentData: EnvData;
  private _envDataEmitter: InternalEventEmitter<EnvData>;
  private _hostOrigin: string;
  private _publishEmitter: InternalEventEmitter<Publication>;
  private _publishExposedEmitter: EventEmitter<Publication>;

  /**
   * Creates a new client.
   */
  public constructor(configOptions?: ClientConfigOptions) {
    if (configOptions && configOptions.hostOrigin) {
      this._hostOrigin = configOptions.hostOrigin;
    } else {
      this._hostOrigin = window.origin;
    }
    this._clientWindow = window;
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

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this._environmentData.filteredTopics) {
      return;
    }

    const filter = this._environmentData.filteredTopics.get('keydown.topic');
    const keyData = transformKeyEvent(event);

    if (!filter || !inFilter(filter, keyData)) {
      return;
    }

    this._sendToHost({
      msgType: 'publish',
      msg: {
        topic: 'keydown.topic',
        payload: keyData
      }
    });
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
   * Gets the environmental data provided by the host application. This includes things
   * like the current locale, the base URL of the host app, etc.
   */
  public get environmentData() {
    return this._environmentData;
  }

  private _sendToHost(message: ClientToHost): void {
    const validated = validateOutgoing(message);
    if (validated) {
      this._clientWindow.parent.postMessage(validated, this._hostOrigin);
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
    this._clientWindow.addEventListener('keydown', this._onKeyDown);
    this._sendToHost(Lifecycle.startedMessage);
  }

  /**
   * Accessor for the general-purpose pub-sub bus betwen client and host applications.
   * The content of messages on this bus are not defined by this API beyond a basic
   * data wrapper. This is for message formats designed outside of this library and
   * agreed upon as a shared API betwen host and client.
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
    this._clientWindow.removeEventListener('message', this._onWindowMessage);
    this._clientWindow.removeEventListener('click', this._onWindowClick);
    this._clientWindow.removeEventListener('keydown', this._onKeyDown);
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
   * Asks the host application to display a toast/notificaiton message.
   *
   * The page embedding the client app is responsible for handling the fired custom event and
   * presenting/styling the toast.  Application-specific concerns such as level, TTLs,
   * ids for action callbacks (toast click, toast action buttons), etc. can be passed via
   * the `custom` property of the `Toast` type.
   *
   * @param toast the desired toast configuration.
   *
   * @example
   * `worker.requestToast({ title: 'Hello world' });`
   *
   * @example
   * `worker.requestToast({ title: 'Hello', message: 'World' });`
   *
   * @example
   * `worker.requestToast({ title: 'Hello', message: 'World', custom: { ttl: 5, level: 'info' } });`
   */
  public requestToast(toast: Toast) {
    this._sendToHost({
      msgType: 'toastRequest',
      msg: toast
    });
  }
}
