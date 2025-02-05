import { AbstractClient } from "./AbstractClient";
import { ClientToHost } from "./messages/ClientToHost";
import { EnvData } from "./messages/Lifecycle";

/**
 * Client class allowing web workers to interact with the larger
 * iframe-coordinator feature set. 
 */
export class WorkerClient extends AbstractClient<DedicatedWorkerGlobalScope> {
  /**
   * Creates a new Web Worker client.
   */
  public constructor() {
    super();
    this._globalContext = self as any;
  }

  protected _onEnvironmentData(envData: EnvData): void {}

  protected _postMessage(message: ClientToHost): void {
    this._globalContext.postMessage(message);
  }
}
