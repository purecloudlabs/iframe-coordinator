import FrameRouterElement from "../elements/frame-router";
import ClientFrame from "../elements/x-ifc-frame";

export default {
  registerElements() {
    customElements.define("frame-router", FrameRouterElement);
    customElements.define("x-ifc-frame", ClientFrame);
  }
};
