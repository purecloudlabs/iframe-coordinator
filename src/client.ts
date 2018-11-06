import * as EventEmitter from 'events';
import {
  ClientToHost,
  validate as validateOutgoing
} from './messages/ClientToHost';
import {
  HostToClient,
  validate as validateIncoming
} from './messages/HostToClient';

import { EnvData } from './messages/EnvData';
import { Publication, PublicationEventEmitter } from './messages/Publication';
import { Toast } from './messages/Toast';

/**
 * Configuration options given to the client
 * from the host application.
 */
interface ClientConfigOptions {
  clientWindow?: Window;
}

/**
 * The Client is access point for the embedded UI's in the host application.
 */
class Client extends (EventEmitter as { new (): PublicationEventEmitter }) {
  private _isStarted: boolean;
  private _clientWindow: Window;
  private _env: EnvData;
  private _getEnvCb: (env: EnvData) => void;

  public constructor(configOptions: ClientConfigOptions = {}) {
    super();
    this._clientWindow = configOptions.clientWindow || window;
  }

  private _onWindowMessage = (event: MessageEvent) => {
    const validated = validateIncoming(event.data);
    if (validated) {
      this._handleHostMessage(validated);
    }
  }

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
  }

  private _handleHostMessage(message: HostToClient): void {
    switch (message.msgType) {
      case 'publish':
        this.emit(message.msg.topic, message.msg);
        break;
      case 'envData':
        this._env = message.msg as EnvData;
        if (this._getEnvCb) {
          this._getEnvCb(this._env);
        }
        return;
    }
  }

  public getEnvData(callback: (env: EnvData) => void): void {
    this._getEnvCb = callback;

    if (this._env) {
      this._getEnvCb(this._env);
    }
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

export { Client, Publication };
