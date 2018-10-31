import {
  ClientToHost,
  validate as validateClientMsg
} from './messages/ClientToHost';
import { Publication } from './messages/Publication';
import { Toast } from './messages/Toast';
import {
  HostToClient,
  validate as validateHostMsg
} from './messages/HostToClient';
import { SubscriptionManager, PublicationHandler } from './SubscriptionManager';

interface ClientConfigOptions {
  clientWindow?: Window;
}

class Client {
  private _subscriptionManager: SubscriptionManager;
  private _isStarted: boolean;
  private _clientWindow: Window;

  public constructor(configOptions: ClientConfigOptions = {}) {
    this._clientWindow = configOptions.clientWindow || window;
    this._subscriptionManager = new SubscriptionManager();
  }

  private _sendToHost = (message: ClientToHost) => {
    const validated = validateClientMsg(message);
    if (validated) {
      this._clientWindow.parent.postMessage(validated, '*');
    }
  };

  private _handleHostMessage = (message: HostToClient) => {
    switch (message.msgType) {
      case 'publish':
        this._subscriptionManager.dispatchMessage(message.msg);
    }
  };

  private _onWindowMessage = (event: MessageEvent) => {
    const validated = validateHostMsg(event.data);
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

  public start(): void {
    if (this._isStarted) {
      return;
    }

    this._isStarted = true;

    this._clientWindow.addEventListener('message', this._onWindowMessage);
    this._clientWindow.addEventListener('click', this._onWindowClick);
  }

  public stop(): void {
    if (!this._isStarted) {
      return;
    }

    this._isStarted = false;
    this._clientWindow.removeEventListener('message', this._onWindowMessage);
    this._clientWindow.removeEventListener('click', this._onWindowClick);
  }

  private _checkStarted(): void {
    if (!this._isStarted) {
      throw new Error(
        'Unable to perform action since this client object was not started'
      );
    }
  }

  // Subscribe to messages from host
  public subscribe(topic: string): void {
    this._subscriptionManager.subscribe(topic);
  }

  public unsubscribe(topic: string): void {
    this._subscriptionManager.unsubscribe(topic);
  }

  public publish(publication: Publication): void {
    this._sendToHost({
      msgType: 'publish',
      msg: publication
    });
  }

  public onPubsub(callback: PublicationHandler): void {
    this._subscriptionManager.setHandler(callback);
  }

  /**
   * Request a toast message be displayed by the host.
   *
   * The page embedding the host is responsible for handling the fired custom event and
   * presenting/styling the toast.  Application-specific concerns such as level, TTLs,
   * ids for action callbacks (toast click, toast action buttons), etc. can be passed via an object
   * as the custom property of the options param.
   *
   * @param {string} message - The message content of the toast
   * @param {object=} options - Supplimental toast options.
   * @param {string=} options.title - Optional title for the toast.
   * @param {object=} options.custom - Optional, application-specific toast properties.  Note: Properties must be JSON serializable.
   *
   * @example
   * worker.requestToast('Hello world');
   *
   * @example
   * worker.requestToast('World', {title: 'Hello'});
   *
   * @example
   * worker.requestToast('World', {title: 'Hello', custom: {ttl: 5, level: 'info'}});
   */
  public requestToast(toast: Toast) {
    this._sendToHost({
      msgType: 'toastRequest',
      msg: toast
    });
  }
}

export { Client };
