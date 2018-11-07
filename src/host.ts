import FrameRouterElement from './elements/frame-router';
import ClientFrame from './elements/x-ifc-frame';

/**
 * Registers custom elements used by the host application
 * when hosting the coordinated client UI fragments.
 */
function registerElements(): void {
  customElements.define('frame-router', FrameRouterElement);
  customElements.define('x-ifc-frame', ClientFrame);
}

export { registerElements, FrameRouterElement };
