import { ToastingClient, ToastOptions } from './types';
import {
  WORKER_MESSAGING_PROTOCOL_NAME,
  WorkerLifecycleEvents,
  WorkerToHostMessageTypes
} from './workers/constants';

const ctx: Worker = self as any;

export default class BackgroundClient implements ToastingClient {
  public requestToast(
    message: string,
    { title = null, custom = null }: ToastOptions = {}
  ): void {
    this._publishMessageToHost(WorkerToHostMessageTypes.toastRequest, {
      title,
      message,
      custom
    });
  }

  // TODO Change this to URL based?
  public requestNavigation(route: string): void {
    this._publishMessageToHost(WorkerToHostMessageTypes.navRequest, {
      fragment: route
    });
  }

  public unloadReady(): void {
    this._publishMessageToHost(WorkerLifecycleEvents.unload_ready);
  }

  private _publishMessageToHost(msgType: string, msg?: object): void {
    ctx.postMessage({
      protocol: WORKER_MESSAGING_PROTOCOL_NAME,
      msgType,
      msg
    });
  }
}
