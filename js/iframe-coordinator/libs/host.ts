import FrameRouterElement from "../elements/frame-router";
import ClientFrame from "../elements/x-ifc-frame";

function registerElements(): void {
  customElements.define("frame-router", FrameRouterElement);
  customElements.define("x-ifc-frame", ClientFrame);
}

export { registerElements };
