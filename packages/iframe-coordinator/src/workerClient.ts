import { EnvData, IfcClient } from "./baseClient";
import { ClientToHost } from "./messages/ClientToHost";

export class WorkerClient extends IfcClient<DedicatedWorkerGlobalScope> {
  /**
   * Creates a new client.
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
