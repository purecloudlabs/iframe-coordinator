import { EnvData } from "./messages/Lifecycle";
import { HostManager } from "./hostManager";
import { HostToClient } from "./messages/HostToClient";
import { Publication } from "./messages/Publication";

/**
 * Data structure defining the list of web workers, and any environmental data
 * they may need for initialization.
 */
export interface WorkerConfig {
  /** Web worker registrations */
  clients: WorkerRegistry;
  /** Information about the host environment. */
  envData: EnvData;
}

/**
 * Map from logical identifier to worker details. Keys are used to address workers.
 */
export interface WorkerRegistry {
  [key: string]: WorkerItem;
}

/**
 * Web worker metadata.
 */
export interface WorkerItem {
  /** The script to run for the worker */
  script: "string | URL";
  /** Application metadata. Allows a worker easily generate links for an associated application */
  app: AppData;
}

/**
 * Worker-associated application data
 */
export interface AppData {
  /** The URL of the associated app */
  url: string;
  /** The route the application is assigned to in the {@link host.FrameRouterElement | FrameRouterElement}'s {@link host.ClientConfig | ClientConfig} */
  assignedRoute: string;
}

interface WorkerMap {
  [key: string]: Worker;
}

/**
 * Class for managing a collection of worker processes. The WorkerPool is an
 * EventTarget and emits events in the same way as the {@link host.FrameRouterElement | FrameRouterElement},
 * although with fewer possible events.
 */
export class WorkerPool extends EventTarget {
  private _isStarted: boolean;
  private _workers: WorkerMap = {};
  private _hostManager: HostManager;

  /** Creates a new worker pool */
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
        return workerPool._workerConfig.clients[clientId]?.app.assignedRoute;
      }
    }

    this._hostManager = new WorkerManager(this);
  }

  private _workerConfig: WorkerConfig;

  /**
   * Set the configured workers for the pool.
   *
   * Changing this after the pool has been started will throw an Error. If you
   * have a need to dynamically change the set of running workers, please reach
   * out with your use case.
   */
  set workerConfig(clientConfig: WorkerConfig) {
    if (this._isStarted) {
      throw new Error("Cannot change workers while running");
    }
    this._workerConfig = clientConfig;
    this._hostManager.envData = clientConfig.envData;
  }

  /**
   * Get the configured workers for the pool.
   */
  get workerConfig(): WorkerConfig {
    return this._workerConfig;
  }

  /**
   * True if the worker is running.
   */
  get isRunning(): boolean {
    return this._isStarted;
  }

  /**
   * Start the worker pool, and all associated workers.
   */
  public start(): void {
    if (this._isStarted) {
      return;
    }

    Object.entries(this._workerConfig.clients).forEach(([clientId, client]) => {
      const workerUrl = client.script;
      this._workers[clientId] = new Worker(workerUrl);
      this._workers[clientId].addEventListener("message", (msg) => {
        this._hostManager.handleClientMessage(msg, clientId);
      });
    });

    this._isStarted = true;
  }

  /**
   * Stops the worker pool, immediately terminating all registered workers. Does
   * nothing if the pool was never started.
   */
  public stop(): void {
    if (!this._isStarted) {
      return;
    }

    for (let workerId in this._workers) {
      this._workers[workerId].terminate();
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
