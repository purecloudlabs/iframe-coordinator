import { HostToClient, validate } from './messages/HostToClient';

class ClientProgram {
  private _subscriptions: SubscribeHandler[];
  private _interestedTopics: Set<string>;

  constructor() {
    this._subscriptions = [];
    this._interestedTopics = new Set();
  }

  public subscribe(topic: string): void {
    this._interestedTopics.add(topic);
  }

  public unsubscribe(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  private _isMessageInteresting(message: HostToClient) {
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

  public messageEventReceived(message: HostToClient): void {
    for (const handler of this._subscriptions) {
      if (this._isMessageInteresting(message)) {
        handler(message);
      }
    }
  }

  public onMessageFromHost(handler: SubscribeHandler): void {
    this._subscriptions.push(handler);
  }
}

export { ClientProgram };
