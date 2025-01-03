import { EventEmitter, InternalEventEmitter } from "./EventEmitter";
import { RoutingMap } from "./HostRouter";
import { EnvData } from "./messages/Lifecycle";
import { Publication } from "./messages/Publication";

/** A property that can be set to initialize the worker pool with the
 * possible clients and the environmental data required by the clients
 */
interface ClientConfig {
  /** The map of registrations for the available clients. */
  clients: RoutingMap;
  /** Information about the host environment. */
  envData: EnvData;
}

export default class WorkerPool {
  private _isStarted: boolean;
  private _worker: Worker;
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

  public start(): void {
    if (this._isStarted) {
      return;
    }

    this._isStarted = true;
    
  }

    public stop(): void {
      if (!this._isStarted) {
        return;
      }
  
      this._isStarted = false;
    }

}
