import { Host } from "../elm/Host.elm";
import ClientFrame from "./x-ifc-frame";
import {LabeledMsg, Publication} from "../libs/types";

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
    toClient: {
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

    this.router.ports.toClient.subscribe(message => {
        let frame = this.getElementsByTagName('x-ifc-frame')[0] as ClientFrame;
        if (frame) {
            frame.send(message);
        } 
    });
  }

  subscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msgType: "subscribe",
      msg: topic
    });
  }

  unsubscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msgType: "unsubscribe",
      msg: topic
    });
  }

  publish(publication: Publication): void {
    this.router.ports.fromHost.send({
      msgType: "publish",
      msg: publication
    });
  }

}

export default FrameRouterElement;
