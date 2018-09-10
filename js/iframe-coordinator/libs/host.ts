import FrameRouterElement from "../elements/frame-router";
import ComponentFrame from "../elements/component-frame";

export default {
  registerElements() {
    customElements.define("frame-router", FrameRouterElement);
    customElements.define("component-frame", ComponentFrame);
  }
};
