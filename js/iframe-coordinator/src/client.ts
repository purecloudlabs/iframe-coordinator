import { ClientProgram } from './ClientProgram';
import { ClientToHost } from './messages/ClientToHost';
import { Publication } from './messages/Publication';
import { Toast } from './messages/Toast';
import { PublicationHandler } from './types';

interface ClientConfigOptions {
  clientWindow?: Window;
}

class Client {
  private _worker: ClientProgram;
  private _isStarted: boolean;
  private _clientWindow: Window;
  private _messageHandlers: PublicationHandler[] = [];

  public constructor(configOptions: ClientConfigOptions = {}) {
    this._clientWindow = configOptions.clientWindow || window;
    this._worker = new ClientProgram();
  }

  private _sendToHost = (message: ClientToHost) => {
    this._clientWindow.parent.postMessage(message, '*');
  };

  private _publishMessageToHandlers = (message: LabeledMsg) => {
    // Message from
    if (message.msgType !== 'publish') {
      return;
    }

    this._messageHandlers.forEach(handler => {
      handler(message.msg);
    });
  };

  private _onWindowMessageReceived = (event: MessageEvent) => {
    // Send the window message down to the client
    this._worker.messageEventReceived(event.data);
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

    this._clientWindow.addEventListener(
      'message',
      this._onWindowMessageReceived
    );
    this._clientWindow.addEventListener('click', this._onWindowClick);
    this._worker.onMessageFromHost(this._publishMessageToHandlers);
    this._worker.onMessageToHost(this._sendToHost);
  }

  public stop(): void {
    if (!this._isStarted) {
      return;
    }

    this._isStarted = false;
    this._clientWindow.removeEventListener(
      'message',
      this._onWindowMessageReceived
    );
    this._clientWindow.removeEventListener('click', this._onWindowClick);

    // TODO offMessageToPublish
  }

  private _checkStarted(): void {
    if (!this._isStarted) {
      throw new Error(
        'Unable to perform action since this client object was not started'
      );
    }
  }

  private _sendMessage(type: string, data: any): void {
    this._checkStarted();
    this._worker.send({
      msgType: type,
      msg: data
    });
  }

  // Subscribe to messages from host
  public subscribe(topic: string): void {
    this._worker.subscribe(topic);
  }

  public unsubscribe(topic: string): void {
    this._worker.unsubscribe(topic);
  }

  public publish(publication: Publication): void {
    this._sendMessage('publish', publication);
  }

  public onPubsub(callback: PublicationHandler): void {
    // Message
    this._messageHandlers.push(callback);
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
