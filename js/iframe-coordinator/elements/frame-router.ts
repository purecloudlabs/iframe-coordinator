import { HostProgram } from "../elm/HostProgram.elm";

interface HostProgram {
  ports: {
    componentIn: {
      send: (message) => void;
    };
  };
}

class FrameRouterElement extends HTMLElement {
  router: HostProgram;

  constructor() {
    super();
    this.setAttribute("style", "position: relative;");
  }

  registerComponents(components) {
    this.router = HostProgram.embed(this, components);

    window.addEventListener("message", event => {
      this.router.ports.componentIn.send(event.data);
    });
  }
}

export default FrameRouterElement;
