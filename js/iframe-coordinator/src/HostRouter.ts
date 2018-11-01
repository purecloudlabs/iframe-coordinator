import ClientFrame from './elements/x-ifc-frame';
import {
  ClientToHost,
  validate as validateIncoming
} from './messages/ClientToHost';
import {
  HostToClient,
  validate as validateOutgoing
} from './messages/HostToClient';
import { Publication } from './messages/Publication';

/**
 * Rendering and routing information for a client.
 */
interface ClientRegistration {
  url: string;
  assignedRoute: string;
}

/**
 * HostRouter is responsible for routing messages from the {@link Host}
 * to the underlying iframe.
 */
class HostRouter {
  private _routingMap: { [key: string]: ClientRegistration };
  private _clientFrame: ClientFrame;
  private _toHostSubscriptions: SubscribeHandler[];
  private _interestedTopics: Set<string>;

  constructor(options: {
    node: HTMLElement;
    routingMap: { [key: string]: ClientRegistration };
  }) {
    this._routingMap = options.routingMap;
    this._interestedTopics = new Set();
    this._toHostSubscriptions = [];

    this._clientFrame = new ClientFrame();
    this._clientFrame.setAttribute('src', 'about:blank');
    this._clientFrame.addEventListener('clientMessage', (data: CustomEvent) => {
      const validate = validateIncoming(data.detail);
      if (validate) {
        this._clientMessageFromFrame(validate);
      }
    });
    options.node.appendChild(this._clientFrame);
  }

  public subscribeToMessages(topic: string): void {
    this._interestedTopics.add(topic);
  }

  public unsubscribeToMessages(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  public onSendToHost(handler: SubscribeHandler): void {
    this._toHostSubscriptions.push(handler);
  }

  public publishGenericMessage(message: HostToClient) {
    const validated = validateOutgoing(message);
    if (validated) {
      this._clientFrame.send(message);
    }
  }

  private _clientMessageFromFrame(message: LabeledMsg): void {
    for (const handler of this._toHostSubscriptions) {
      if (this._handleMessageType(message)) {
        handler(message);
      }
    }
  }

  // TODO this is where we will need to decode properly.
  private _handleMessageType(message: LabeledMsg) {
    switch (message.msgType) {
      case 'publish':
        if (this._interestedTopics.has(message.msg.topic)) {
          return true;
        }
        return false;
      default:
        return true;
    }
  }

  public changeRoute(route: string) {
    let urlRoute: string = 'about:blank';
    for (const key in this._routingMap) {
      if (this._routingMap.hasOwnProperty(key)) {
        const element = this._routingMap[key];
        if (element.assignedRoute === route) {
          urlRoute = element.url;
        }
      }
    }

    this._clientFrame.setAttribute('src', urlRoute);
  }
}

export { HostRouter, Publication };
