interface LabeledMsg {
  msgType: string;
  msg: any;
}

interface SubscribeHandler {
  (msg: LabeledMsg): void;
}

interface InPort {
  send(msg: LabeledMsg): void;
}

interface OutPort {
  subscribe(handler: SubscribeHandler): void;
  unsubscribe(handler: SubscribeHandler): void;
}

interface ClientProgram {
  ports: {
    fromHost: {
      send({ origin: string, data: any }): any;
    };
    toHost: OutPort;
    fromClient: InPort;
    toClient: OutPort;
  };
}

declare module "*/Client.elm" {
  export var Elm: {
    Client: {
      init(): ClientProgram;
    };
  };
}

interface HostProgram {
  ports: {
    fromHost: InPort;
    toHost: OutPort;
    toClient: OutPort;
  };
}

interface ClientRegistrations {}

declare module "*/Host.elm" {
  export interface Publication {
    topic: string;
    payload: any;
  }

  export var Elm: {
    Host: {
      init(options: { node: HTMLElement; flags: ClientRegistrations }): HostApp;
    };
  };
}
