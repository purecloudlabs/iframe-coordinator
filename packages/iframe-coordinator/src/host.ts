import FrameRouterElement, { ClientConfig } from "./elements/frame-router";
import { WorkerAppData, WorkerConfig, WorkerItem, WorkerPool, WorkerRegistry } from "./WorkerPool";
/* re-exported for better docs */
import { ClientRegistration, RoutingMap } from "./HostRouter";
import { EnvData, KeyData } from "./messages";

/**
 * Registers custom elements used by the host application
 * when hosting the coordinated client UI fragments.
 */
function registerCustomElements(): void {
  customElements.define("frame-router", FrameRouterElement);
}

export {
  registerCustomElements,
  FrameRouterElement,
  WorkerPool,
  type WorkerAppData,
  type ClientConfig,
  type ClientRegistration,
  type RoutingMap,
  type WorkerConfig,
  type WorkerItem,
  type WorkerRegistry,
};

// Lecacy compatibility exports - superceded by messaging.ts
export {
  type EnvData,
  type KeyData,
}
