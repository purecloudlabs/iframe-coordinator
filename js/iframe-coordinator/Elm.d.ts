declare module "*/Client.elm" {
  export interface LabeledMsg {
    msgType: string;
    msg: any;
  }

  export interface MessageData {
    origin: string;
    data: any;
  }

  export interface Worker {
    requestToast: Function;
    ports: {
      fromHost: {
        send: (message: MessageData) => void;
      };
      fromClient: {
        send: (message: LabeledMsg) => void;
      };
      toHost: {
        subscribe: (message: any) => void;
      };
      toClient: {
        subscribe: (message: any) => void;
      };
    };
  }

  interface Client {
    worker(): Worker;
  }

  export var Client: Client;
}

declare module "*/Host.elm" {
  export interface ClientRegistrations {}

  export interface LabeledMsg {
    msgType: string;
    msg: any;
  }

  export interface Publication {
    topic: string;
    payload: any;
  }

  export interface HostRouter {
    ports: {
      fromHost: {
        send: (message: LabeledMsg) => void;
      };
      toHost: {
        subscribe(subscribeHandler: (msg: LabeledMsg) => void): void;
      };
      toClient: {
        subscribe(subscribeHandler: (msg: LabeledMsg) => void): void;
      };
    };
  }

  interface Host {
    embed(baseElement: any, clientRegistrations: any): HostRouter;
  }

  export var Host: Host;
}
