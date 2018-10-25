import ClientFrame from './elements/x-ifc-frame';

interface ClientRegistration {
  url: string;
  assignedRoute: string;
}

interface Publication {
  topic: string;
  payload: any;
}

class HostProgram {
  private _flags: { [key: string]: ClientRegistration };
  private _clientFrame: ClientFrame;
  private _subscriptions: SubscribeHandler[];
  private _subscriptions2: SubscribeHandler[];
  private _interestedTopics: Set<string>;

  constructor(options: {
    node: HTMLElement;
    flags: { [key: string]: ClientRegistration };
  }) {
    this._flags = options.flags;
    this._interestedTopics = new Set();
    this._subscriptions = [];
    this._subscriptions2 = [];

    this._clientFrame = new ClientFrame();
    this._clientFrame.setAttribute('src', 'about:blank');
    this._clientFrame.addEventListener('clientMessage', (data: any) => {
      this._send(data.detail);
    });
    options.node.appendChild(this._clientFrame);
  }

  public subscribeToMessages(topic: string): void {
    this._interestedTopics.add(topic);
  }

  public unsubscribeToMessages(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  public onMessageToHost(handler: SubscribeHandler): void {
    this._subscriptions.push(handler);
  }

  public onSendToClient(handler: SubscribeHandler): void {
    this._subscriptions2.push(handler);
  }

  public publishGenericMessage(message: LabeledMsg) {
    for (const handler of this._subscriptions) {
      handler(message);
    }
  }

  private _send(message: LabeledMsg): void {
    for (const handler of this._subscriptions) {
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
    for (const key in this._flags) {
      if (this._flags.hasOwnProperty(key)) {
        const element = this._flags[key];
        if (element.assignedRoute === route) {
          urlRoute = element.url;
        }
      }
    }

    this._clientFrame.setAttribute('src', urlRoute);
  }
}

export { HostProgram, Publication };
