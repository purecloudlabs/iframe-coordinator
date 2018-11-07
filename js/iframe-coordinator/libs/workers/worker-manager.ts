// import [* as] SpawnWorker from "../workers/SpawnWorker.worker.ts";
/* Exporting as a class gets by the typescript check and loads the file, however, the constructor
isn't called.  Also, the umd version of the module can't find the default since the worker-loader
seems to export as a constructor function anyway.  So, the raw text version seems to be the best
approach at this point*/
import { v4 as uuidv4 } from 'uuid';
import {
  WORKER_MESSAGING_PROTOCOL_NAME,
  WorkerLifecycleEvents,
  WorkerToHostMessageTypes
} from './constants';
import * as SpawnWorker from './spawn-worker.worker.ts';

export const WORKER_MESSAGE_EVENT_TYPE: string = 'workermessage';

const DEFAULT_ERROR_WINDOW_COUNT_THRESHOLD = 10;
const DEFAULT_ERROR_WINDOW_MILLIS = 30000;
const DEFAULT_UNLOAD_TIMEOUT_MILLIS = 10000;

/*
 * TODO for this feature:

 * add config for spawned workers to shutdown
 * Feature detect for workers
 * Move config to be per-worker
 *  make a type/class
 *  add cleanup boolean here
 *  pass into constructor for defaults and load function
 *  class also has an instance for default defaults
 *  type ManagedWorkerConfig = {
 *    url: string;
 *    // Optional?
 *    errorWindowCountThreshold: number;
 *    errorWindowMillis: number;
 *    requestUnloadNotification:boolean;
 *    unloadTimeoutMillis: number;
 *  }
 * Make a type/class for each Message (type and payload)
 * Break out lifecycle and event message processing better
 * make sure lifecycle phase is valid before advancing/regressing
 * get bi-directional comms working
 *  need to add an interface for the background client
 *  need to add listener for events
 * Finalize backgroundClient api
   * Check on impl interface idea and add NavigationRequester interface
   * should navRequest be url based?
   * Will docs get pulled in correctly? pull them from client.ts
 * Message validation
  * Add checks to ensure lifecycle is not updated to prior state?
  * Ensure payload is valid for message types
  * Better checks to ensure all enums and cases are handled?
  * stronger types of messages between this manager and the workers?
 * docs
 *   dont forget that this is sorta dangerous with indexeddb
 *
 * Is the import of the worker good enough?
  * Decide on class or text of the worker
 * Make sure es6 target is ok
 * Make sure it works in IE
 *  check blob and fallback
 *  check on object.assign polyfill
 * Improve worker demo for the real, useful demo.
 *  use subscribe?
 *  allow dynamic addition?
 * Tests
 *  tests for error rate
 *  lifecycle
 * better logging (these are important)
 *
 * Future feature:
 *  allow restart; auto or manual?
 *  worker-requested unload?
 *    will need to support a restart
 */

enum WorkerPhase {
  LOADING,
  LOADED,
  BOOTSTRAPPING,
  RUNNING,
  UNLOADING
}

interface ManagedWorker {
  id: string;
  url: string;
  phase: WorkerPhase;
  spawnWorkerToken: string;
  worker: Worker;
  errorWindowCount: number;
  errorWindowStartTimestamp: number;
  awaitSpawnWorkerUnload: boolean;
  spawnWorkerUnloaded: boolean;
  spawnedWorkerUnloadRequested: boolean;
  awaitSpawnedWorkerUnload: boolean;
  spawnedWorkerUnloaded: boolean;
}

export default class WorkerManager implements EventListenerObject, EventTarget {
  private static trackedWorkerEventTypes = ['message', 'error'];
  private static evtTargetDelegate: DocumentFragment = null;
  private static ID_PREFIX = 'iframeCoordinatorWorker-';
  private static _workerIndex = 0;
  private _workers: ManagedWorker[];
  private _errorWindowCountThreshold: number;
  private _errorWindowMillis: number;
  private _unloadTimeoutMillis: number;

  constructor(
    errorWindowCountThreshold: number = DEFAULT_ERROR_WINDOW_COUNT_THRESHOLD,
    errorWindowMillis: number = DEFAULT_ERROR_WINDOW_MILLIS,
    unloadTimeoutMillis: number = DEFAULT_UNLOAD_TIMEOUT_MILLIS
  ) {
    this._errorWindowCountThreshold = errorWindowCountThreshold;
    this._errorWindowMillis = errorWindowMillis;
    this._unloadTimeoutMillis = unloadTimeoutMillis;

    if (WorkerManager.evtTargetDelegate === null) {
      WorkerManager.evtTargetDelegate = document.createDocumentFragment();
    }

    this._workers = [];
  }

  public load(url: string): string {
    const id = `${WorkerManager.ID_PREFIX}${++WorkerManager._workerIndex}`;

    // @ts-ignore
    const worker = new SpawnWorker();
    WorkerManager.trackedWorkerEventTypes.forEach(curr => {
      worker.addEventListener(curr, this);
    });

    this._workers.push({
      id,
      url,
      spawnWorkerToken: uuidv4(),
      worker,
      phase: WorkerPhase.LOADING,
      errorWindowCount: 0,
      errorWindowStartTimestamp: -1,
      awaitSpawnWorkerUnload: false, // false until the spawn worker acks
      spawnWorkerUnloaded: false,
      spawnedWorkerUnloadRequested: false,
      awaitSpawnedWorkerUnload: false, // false unless configured and successfully bootstrapped
      spawnedWorkerUnloaded: false
    });

    return id;
  }

  /**
   * Unload the worker with id, idToUnload
   *
   * If configured and applicable, the manager will request a before_unload from both the
   * spawning and spawned workers and wait #_unloadTimeoutMillis for a successful unload_ready response.
   *
   * When all cleanup is completed or when the timeout is reached, the worker will be
   * permanently removed.
   *
   * This method can be recalled to re-evaluate reported listener state and quickly terminate
   * the worker rather than wait on the configured timeout.  (e.g. call after each listener reports)
   *
   * @param idToUnload
   */
  public unload(idToUnload: string) {
    const managedWorkerToUnload = this._workers.find((curr, index) => {
      return curr.id === idToUnload;
    });

    if (!managedWorkerToUnload) {
      return;
    }

    const outstandingUnloadListener =
      (managedWorkerToUnload.awaitSpawnWorkerUnload &&
        !managedWorkerToUnload.spawnWorkerUnloaded) ||
      (managedWorkerToUnload.awaitSpawnedWorkerUnload &&
        !managedWorkerToUnload.spawnedWorkerUnloaded);

    if (!outstandingUnloadListener) {
      this._remove(idToUnload);
      return;
    }

    if (managedWorkerToUnload.phase !== WorkerPhase.UNLOADING) {
      managedWorkerToUnload.phase = WorkerPhase.UNLOADING;

      this._dispatchMessage(
        managedWorkerToUnload.worker,
        WorkerLifecycleEvents.before_unload
      );

      // Set a timeout to force unload if we don't hear back.
      setTimeout(() => {
        this._remove(idToUnload, true);
      }, this._unloadTimeoutMillis);
    }
  }

  private _remove(idToRemove: string, timedOut: boolean = false) {
    const workerIndexToRemove = this._workers.findIndex((curr, index) => {
      return curr.id === idToRemove;
    });

    if (workerIndexToRemove >= 0) {
      const managedWorkerToRemove = this._workers[workerIndexToRemove];
      WorkerManager.trackedWorkerEventTypes.forEach(curr => {
        managedWorkerToRemove.worker.removeEventListener(curr, this);
      });
      managedWorkerToRemove.worker.terminate();

      this._workers.splice(workerIndexToRemove, 1);

      if (timedOut) {
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.warn('Worker force-stopped due to unload timeout', {
          workerDetails: managedWorkerToRemove
        });
      }
    }
  }

  // TODO Need comms to workers (pub/sub, others?)

  // Event Management
  public addEventListener(type: string, listener: any, capture?: any): void {
    WorkerManager.evtTargetDelegate.addEventListener(type, listener, capture);
  }

  public dispatchEvent(event: Event): boolean {
    return WorkerManager.evtTargetDelegate.dispatchEvent(event);
  }

  public removeEventListener(type: string, listener: any, capture?: any): void {
    WorkerManager.evtTargetDelegate.removeEventListener(
      type,
      listener,
      capture
    );
  }

  public handleEvent(evt: Event): void {
    if (evt instanceof MessageEvent) {
      this._onWorkerMsg(evt);
    } else if (evt instanceof ErrorEvent) {
      const managedWorker = this._workers.find(curr => {
        return curr.worker === evt.target;
      });

      if (managedWorker) {
        const currentTimestamp = Date.now();

        if (managedWorker.errorWindowStartTimestamp < 0) {
          // First Error
          managedWorker.errorWindowStartTimestamp = currentTimestamp;
          managedWorker.errorWindowCount = 1;
          return;
        }

        const delta = Math.max(
          currentTimestamp - managedWorker.errorWindowStartTimestamp,
          0
        );
        if (delta > this._errorWindowMillis) {
          // Window expired; start new window
          managedWorker.errorWindowStartTimestamp = currentTimestamp;
          managedWorker.errorWindowCount = 1;
          return;
        } else {
          managedWorker.errorWindowCount++;

          if (
            managedWorker.errorWindowCount > this._errorWindowCountThreshold
          ) {
            // TODO Need to add proper logging support
            // tslint:disable-next-line
            console.error('Error rate exceeded.  Stopping the worker', {
              workerDetails: managedWorker,
              errorWindowCount: managedWorker.errorWindowCount,
              errorWindowStartTimestamp:
                managedWorker.errorWindowStartTimestamp,
              errorWindowDurationMillis: delta,
              errorDetails: evt.error
            });

            this.unload(managedWorker.id);
          }
        }
      }
    }
  }

  private _onWorkerMsg(evt: MessageEvent) {
    if (evt.data.protocol !== WORKER_MESSAGING_PROTOCOL_NAME) {
      // Not a handled message type
      return;
    }

    if (!evt.data.msgType) {
      // TODO Need to add proper logging support
      // tslint:disable-next-line
      console.error('No msgType property provided on worker message');
      return;
    }

    const targetIndex = this._workers.findIndex(curr => {
      return curr.worker === evt.target;
    });

    if (targetIndex < 0) {
      // TODO Need to add proper logging support
      // tslint:disable-next-line
      console.error('Received message from unknown worker');
      return;
    }

    const managedWorker = this._workers[targetIndex];
    const worker = managedWorker.worker;

    switch (evt.data.msgType) {
      case WorkerLifecycleEvents.loaded:
        managedWorker.phase = WorkerPhase.LOADED;
        managedWorker.awaitSpawnWorkerUnload = true;

        this._dispatchMessage(
          managedWorker.worker,
          WorkerLifecycleEvents.bootstrap,
          {
            workerUrl: managedWorker.url,
            spawnWorkerToken: managedWorker.spawnWorkerToken
          }
        );
        break;
      case WorkerLifecycleEvents.bootstrap_failed:
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.error('Failed to bootstrap the worker.  Stopping the worker', {
          workerId: managedWorker.id,
          workerUrl: managedWorker.url,
          error: evt.data.msg.error
        });

        this.unload(managedWorker.id);
        break;
      case WorkerLifecycleEvents.bootstrapped:
        managedWorker.phase = WorkerPhase.RUNNING;
        managedWorker.awaitSpawnedWorkerUnload =
          managedWorker.spawnedWorkerUnloadRequested;
        break;
      case WorkerLifecycleEvents.unload_ready:
        if (
          evt.data.msg &&
          evt.data.msg.spawnWorkerToken === managedWorker.spawnWorkerToken
        ) {
          // Only the spawn worker knows this token
          managedWorker.spawnWorkerUnloaded = true;
        } else {
          managedWorker.spawnedWorkerUnloaded = true;
        }

        this.unload(managedWorker.id);
        break;
      case WorkerToHostMessageTypes.ToastRequest:
        // TODO need more validation
        this.dispatchEvent(
          new CustomEvent(WORKER_MESSAGE_EVENT_TYPE, { detail: evt.data })
        );
        break;
      case WorkerToHostMessageTypes.NavRequest:
        // TODO need more validation
        this.dispatchEvent(
          new CustomEvent(WORKER_MESSAGE_EVENT_TYPE, { detail: evt.data })
        );
        break;
      // TODO Need better way to ensure all cases are handled
      default:
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.error('Received unknown msgType from worker', {
          workerDetails: managedWorker,
          msgType: evt.data.msgType
        });
        return;
    }
  }

  private _dispatchMessage(
    worker: Worker,
    msgType: string,
    basePayload: object = {}
  ): void {
    const fullPayload = Object.assign({}, basePayload, {
      protocol: WORKER_MESSAGING_PROTOCOL_NAME,
      msgType
    });

    worker.postMessage(fullPayload);
  }
}
