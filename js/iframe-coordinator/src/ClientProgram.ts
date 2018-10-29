class ClientProgram {
  private _subscriptions: SubscribeHandler[];
  private _toHostSubscriptions: SubscribeHandler[];
  private _interestedTopics: Set<string>;

  constructor() {
    this._subscriptions = [];
    this._toHostSubscriptions = [];
    this._interestedTopics = new Set();
  }

  public subscribe(topic: string): void {
    this._interestedTopics.add(topic);
  }

  public unsubscribe(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  public send(message: LabeledMsg): void {
    for (const handler of this._toHostSubscriptions) {
      handler(message);
    }
  }

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

  public messageEventReceived(message: LabeledMsg): void {
    for (const handler of this._subscriptions) {
      if (this._handleMessageType(message)) {
        handler(message);
      }
    }
  }

  public onMessageFromHost(handler: SubscribeHandler): void {
    this._subscriptions.push(handler);
  }

  public onMessageToHost(handler: SubscribeHandler): void {
    this._toHostSubscriptions.push(handler);
  }
}

export { ClientProgram };
