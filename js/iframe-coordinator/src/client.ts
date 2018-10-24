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

  private _sendingMessageToHost = (message: LabeledMsg) => {
    this._clientWindow.parent.postMessage(message, '*');
  };

  private _publishMessageToHandlers = (message: LabeledMsg) => {
    if (message.msgType !== 'publish') {
      return;
    }

    this._messageHandlers.forEach(handler => {
      handler(message.msg);
    });
  };

  private _onWindowMessageReceived = (event: MessageEvent) => {
    this._worker.ports.fromHost.send({
      origin: event.origin,
      data: event.data
    });
  };

  private _onWindowClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'a' && event.button === 0) {
      event.preventDefault();
      const a = event.target as HTMLAnchorElement;
      this._sendMessage('navRequest', a.href);
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
    this._worker.subscribe(this._sendingMessageToHost);
    /*
    TODO
    this._worker.ports.toHost.subscribe(this._sendingMessageToHost);
    this._worker.ports.toClient.subscribe(this._publishMessageToHandlers);
    */
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
    /*
    TODO
    this._worker.ports.toHost.unsubscribe(this._sendingMessageToHost);
    this._worker.ports.toClient.unsubscribe(this._publishMessageToHandlers);
    */
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
    /*
    this._worker.ports.fromClient.send({
      msgType: type,
      msg: data
    });
    */
  }

  public subscribe(topic: string): void {
    this._sendMessage('subscribe', topic);
  }

  public unsubscribe(topic: string): void {
    this._sendMessage('unsubscribe', topic);
  }

  public publish(publication: Publication): void {
    this._sendToHost({
      msgType: 'publish',
      msg: publication
    });
  }

  public onPubsub(callback: PublicationHandler): void {
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