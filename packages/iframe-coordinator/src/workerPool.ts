import { EnvData } from "./messages/Lifecycle";
import { HostManager } from "./hostManager";
import { HostToClient } from "./messages/HostToClient";
import { Publication } from "./messages/Publication";

/** A property that can be set to initialize the worker pool with the
 * possible clients and the environmental data required by the clients
 */
interface ClientConfig {
  /** The map of registrations for the available clients. */
  clients: WorkerRegistry;
  /** Information about the host environment. */
  envData: EnvData;
}

interface WorkerMap {
  [key: string]: Worker;
}

interface WorkerRegistry {
  [key: string]: WorkerItem;
}

interface WorkerItem {
  script: "string | URL";
  app: AppData;
}

interface AppData {
  url: string;
  assignedRoute: string;
}

export class WorkerPool extends EventTarget {
  private _isStarted: boolean;
  private _workers: WorkerMap = {};
  private _hostManager: HostManager;

  /** @internal */
  constructor() {
    super();
    const workerPool = this;
    class WorkerManager extends HostManager {
      protected _postMessageToClient(
        message: HostToClient,
        clientId: string,
      ): void {
        workerPool._workers[clientId].postMessage(message);
      }
      protected _getClientAssignedRoute(clientId: string): string {
        return workerPool._clientConfig.clients[clientId]?.app.assignedRoute;
      }
    }

    this._hostManager = new WorkerManager(this);
  }

  private _clientConfig: ClientConfig;

  get clientConfig(): ClientConfig {
    return this._clientConfig;
  }

  set clientConfig(clientConfig: ClientConfig) {
    this._clientConfig = clientConfig;
    this._hostManager.envData = clientConfig.envData;
  }

  public start(): void {
    if (this._isStarted) {
      return;
    }

    Object.entries(this._clientConfig.clients).forEach(([clientId, client]) => {
      const workerUrl = client.script;
      this._workers[clientId] = new Worker(workerUrl);
      console.log("Adding worker listener");
      this._workers[clientId].addEventListener("message", (msg) => {
        console.log("Got worker message", msg);
        this._hostManager.handleClientMessage(msg, clientId);
      });
    });

    this._isStarted = true;
  }

  public stop(): void {
    if (!this._isStarted) {
      return;
    }

    this._isStarted = false;
  }

  /**
   * Publish a message to a worker.
   *
   * @param clientId - The id of the worker the message should be published to
   * 
   * @param publication - The information published to the woker.
   * The topic may not be of interest, and could be ignored.
   */
  public publish(clientId: string, publication: Publication): void {
    this._hostManager.sendToClient({
      msg: publication,
      msgType: "publish",
    }, clientId);
  }
}
