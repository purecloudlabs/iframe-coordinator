interface LabeledMsg {
  msgType: string;
  msg: any;
}

type SubscribeHandler = (msg: LabeledMsg) => void;

interface InPort {
  send(msg: LabeledMsg): void;
}

interface OutPort {
  subscribe(handler: SubscribeHandler): void;
  unsubscribe(handler: SubscribeHandler): void;
}

interface HostMessage {
  origin: string;
  data: any;
}

interface ClientProgram {
  ports: {
    fromHost: {
      send(msg: HostMessage): any;
    };
    toHost: OutPort;
    fromClient: InPort;
    toClient: OutPort;
  };
}

declare module '*/Client.elm' {
  export const Elm: {
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

interface ClientRegistrations {
  [key: string]: ClientConfig;
}

interface RoutableClientConfig {
  url: string;
  assignedRoute: string;
}

interface BackgroundClientConfig {
  background: boolean;
  url: string;
}

type ClientConfig = RoutableClientConfig | BackgroundClientConfig;

declare module '*/Host.elm' {
  export interface Publication {
    topic: string;
    payload: any;
  }

  export const Elm: {
    Host: {
      init(options: { node: HTMLElement; flags: ClientRegistrations }): HostApp;
    };
  };
}
