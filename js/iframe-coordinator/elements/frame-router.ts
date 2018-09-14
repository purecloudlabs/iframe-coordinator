import { Host } from "../elm/Host.elm";

interface LabeledMsg {
  msgType: string;
  msg: any;
}

interface SubscribeHandler {
  (msg: LabeledMsg): void;
}

interface Host {
  ports: {
    fromHost: {
      send(message): void;
    };
    toHost: {
      subscribe(SubscribeHandler): void;
    };
  };
}

class FrameRouterElement extends HTMLElement {
  router: Host;

  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute("style", "position: relative;");
  }

  registerClients(clients) {
    this.router = Host.embed(this, clients);
    this.router.ports.toHost.subscribe(message => {
      if (message.msgType == "publish") {
        let event = new CustomEvent("publish", { detail: message.msg });
        this.dispatchEvent(event);
      }
    });
  }

  subscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msgType: "subscribe",
      msg: topic
    });
  }
}

export default FrameRouterElement;
