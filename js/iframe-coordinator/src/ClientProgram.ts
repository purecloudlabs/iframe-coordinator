import { ClientPorts } from './ClientPorts';

class ClientProgram {
  public ports: ClientPorts;
  private _subscriptions: SubscribeHandler[];

  constructor() {
    this.ports = new ClientPorts();
    this._subscriptions = [];
  }

  public subscribe(handler: SubscribeHandler): void {
    this._subscriptions.push(handler);
  }

  public send(message: LabeledMsg): void {
    for (const handler of this._subscriptions) {
      handler(message);
    }
  }
}

export { ClientProgram };
