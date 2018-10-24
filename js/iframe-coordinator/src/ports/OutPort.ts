class OutPort {
  private _subscriptions: SubscribeHandler[] = [];

  public subscribe(handler: SubscribeHandler): void {
    this._subscriptions.push(handler);
  }

  public unsubscribe(handler: SubscribeHandler): void {
    // TODO implement
  }
}

export { OutPort };
