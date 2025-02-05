import { EventEmitter, InternalEventEmitter } from "./EventEmitter";
import { EnvData } from "./messages/Lifecycle";
import { Publication } from "./messages/Publication";
import {
  API_PROTOCOL,
  applyClientProtocol,
  PartialMsg,
} from "./messages/LabeledMsg";

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

export default class WorkerPool {
  private _isStarted: boolean;
  private _workers: WorkerMap = {};
  private _envData: EnvData;
  private _publishEmitter: InternalEventEmitter<Publication>;
  private _publishExposedEmitter: EventEmitter<Publication>;
  private _currentClientId: string;
  private _currentPath: string;
  private _queuedEvents: Event[];

  /** @internal */
  constructor() {
    this._publishEmitter = new InternalEventEmitter<Publication>();
    this._publishExposedEmitter = new EventEmitter<Publication>(
      this._publishEmitter,
    );
    this._queuedEvents = [];
  }

  private _clientConfig: ClientConfig;

  get clientConfig(): ClientConfig {
    return this._clientConfig;
  }

  set clientConfig(clientConfig: ClientConfig) {
    this._clientConfig = clientConfig;
  }

  public sendMessageToWorker<T, V>(
    worker: Worker,
    partialMsg: PartialMsg<T, V>,
  ): void {
    const message = applyClientProtocol(partialMsg);
    worker.postMessage(message);
  }

  public start(): void {
    if (this._isStarted) {
      return;
    }
    Object.entries(this._clientConfig.clients).forEach(([clientId, client]) => {
      const workerUrl = client.script;
      this._workers[clientId] = new Worker(workerUrl);
    });
    Object.values(this._workers).forEach((worker) => {
      worker.postMessage({ envData: this._clientConfig.envData });
      this.sendMessageToWorker(worker, {
        msgType: "env_init",
        msg: this._clientConfig.envData,
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
}
