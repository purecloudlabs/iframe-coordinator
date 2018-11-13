import FrameRouterElement from './elements/frame-router';

/**
 * Registers custom elements used by the host application
 * when hosting the coordinated client UI fragments.
 */
function registerElements(): void {
  customElements.define('frame-router', FrameRouterElement);
}

export { registerElements, FrameRouterElement };
