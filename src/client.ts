import {
  ClientToHost,
  validate as validateOutgoing
} from './messages/ClientToHost';
import {
  HostToClient,
  validate as validateIncoming
} from './messages/HostToClient';

import { EnvData, Lifecycle } from './messages/Lifecycle';
import { Publication } from './messages/Publication';
import { Toast } from './messages/Toast';
import { PublicationHandler, SubscriptionManager } from './SubscriptionManager';

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
class Client {
  private _subscriptionManager: SubscriptionManager;
  private _isStarted: boolean;
  private _clientWindow: Window;
  private _env: EnvData;
  private _getEnvCb: (env: EnvData) => void;

  public constructor(configOptions: ClientConfigOptions = {}) {
    this._clientWindow = configOptions.clientWindow || window;
    this._subscriptionManager = new SubscriptionManager();
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
        this._subscriptionManager.dispatchMessage(message.msg);
      case 'lifecycle':
        const lifecycleMsg = message.msg as Lifecycle;
        if (lifecycleMsg.stage === 'init') {
          this._env = lifecycleMsg.data;
        }
        return;
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
    this._sendToHost({
      msgType: 'lifecycle',
      msg: {
        stage: 'started'
      }
    });
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
    this._sendToHost({
      msgType: 'lifecycle',
      msg: {
        stage: 'stopped'
      }
    });
  }

  /**
   * Subscribes to topics that may be published by the host application.
   * You can subscribe to multiple topics, however, they will come through
   * the onPubsub handler.
   *
   * @param topic The topic which is of interest to the client content.
   */
  public subscribe(topic: string): void {
    this._subscriptionManager.subscribe(topic);
  }

  /**
   * Unsubscribes to topics being published by the host application.
   *
   * @param topic The topic which is no longer of interest to the client content.
   */
  public unsubscribe(topic: string): void {
    this._subscriptionManager.unsubscribe(topic);
  }

  /**
   * TODO Get the data
   * @param callback data
   */
  public getEnvData(callback: (env: EnvData) => void): void {
    this._getEnvCb = callback;

    if (this._env) {
      this._getEnvCb(this._env);
    }
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
   * Sets the callback for general publication messages coming from the host application.
   *
   * Only one callback may be set.
   *
   * @param callback The handler to be called when a message is published.
   */
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

export { Client };
