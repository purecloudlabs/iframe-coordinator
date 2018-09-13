import { Host } from "../elm/Host.elm";

interface Host {
  ports: {
    fromClient: {
      send: (message) => void;
    };
  };
}

class FrameRouterElement extends HTMLElement {
  router: Host;

  constructor() {
    super();
    this.setAttribute("style", "position: relative;");
  }

  registerClients(clients) {
    this.router = Host.embed(this, clients);

    window.addEventListener("message", event => {
      this.router.ports.fromClient.send(event.data);
    });
  }
}

export default FrameRouterElement;
