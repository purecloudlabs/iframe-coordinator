// import [* as] SpawnWorker from "../workers/SpawnWorker.worker.ts";
/* Exporting as a class gets by the typescript check and loads the file, however, the constructor
isn't called.  Also, the umd version of the module can't find the default since the worker-loader
seems to export as a constructor function anyway.  So, the raw text version seems to be the best
approach at this point*/
import { v4 as uuidv4 } from 'uuid';
import {
  WORKER_MESSAGING_PROTOCOL_NAME,
  WorkerClientEvent,
  WorkerClientEventType,
  WorkerClientHostActionEvent,
  WorkerClientLifecycleEvent,
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

 * add config option so spawned workers can request shutdown
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
 * Adapt worker message types to new method in master
  * Use same naming conventions
  * Make a class for each Message type (msgLabel and payload)
  * Break out lifecycle and event message processing accorting to types
  * Make sure payload is modeled correctly
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
    if (typeof Worker !== 'function') {
      throw new Error('noWorkerSupport');
    }

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
    const targetManagedWorker = this._workers.find(curr => {
      return curr.worker === evt.target;
    });

    if (!targetManagedWorker) {
      // TODO Need to add proper logging support
      // tslint:disable-next-line
      console.error('Received message from unknown worker');
      return;
    }

    if (evt instanceof MessageEvent) {
      this._handleWorkerMessageEvent(evt, targetManagedWorker);
    } else if (evt instanceof ErrorEvent) {
      this._handleWorkerErrorEvent(evt, targetManagedWorker);
    }
  }

  private _handleWorkerMessageEvent(
    msgEvent: MessageEvent,
    targetManagedWorker: ManagedWorker
  ) {
    if (msgEvent.data.protocol !== WORKER_MESSAGING_PROTOCOL_NAME) {
      // Not a handled message type
      return;
    }

    if (!msgEvent.data.msgType) {
      // TODO Need to add proper logging support
      // tslint:disable-next-line
      console.error('No msgType property provided on worker message');
      return;
    }

    const workerClientEvent = this._parseMsgEvent(
      msgEvent,
      targetManagedWorker
    );

    if (!workerClientEvent) {
      // TODO Need to add proper logging support
      // tslint:disable-next-line
      console.error(
        'Worker Message could not be parsed to a known type',
        msgEvent
      );
      return;
    }

    switch (workerClientEvent.kind) {
      case WorkerClientEventType.LIFECYCLE:
        this._handleWorkerLifecycleEvent(
          workerClientEvent,
          targetManagedWorker
        );
        break;
      case WorkerClientEventType.HOST_ACTION:
        this._handleWorkerHostActionEvent(
          workerClientEvent,
          targetManagedWorker
        );
        break;
    }
  }

  /**
   * Returns a WorkerClientEvent or null if it's an unknown message type.
   *
   * @param msgEvent The original inbound event; assumes msgType will be present
   */
  private _parseMsgEvent(
    msgEvent: MessageEvent,
    targetMangedWorker: ManagedWorker
  ): WorkerClientEvent {
    if (msgEvent.data.msgType in WorkerLifecycleEvents) {
      return {
        kind: WorkerClientEventType.LIFECYCLE,
        targetWorker: targetMangedWorker.worker,
        lifecycleEventType: msgEvent.data.msgType,
        fromSpawnWorker:
          msgEvent.data &&
          msgEvent.data.msg &&
          msgEvent.data.msg.spawnWorkerToken ===
            targetMangedWorker.spawnWorkerToken,
        msg: msgEvent.data.msg
      };
    } else if (msgEvent.data.msgType in WorkerToHostMessageTypes) {
      return {
        kind: WorkerClientEventType.HOST_ACTION,
        targetWorker: targetMangedWorker.worker,
        actionType: msgEvent.data.msgType,
        msg: msgEvent.data.msg
      };
    }
    // TODO Use a discriminated untion to make sure we handle all the cases.

    return null;
  }

  private _handleWorkerLifecycleEvent(
    lifecycleEvent: WorkerClientLifecycleEvent,
    targetManagedWorker: ManagedWorker
  ): void {
    switch (lifecycleEvent.lifecycleEventType) {
      case WorkerLifecycleEvents.loaded:
        targetManagedWorker.phase = WorkerPhase.LOADED;
        targetManagedWorker.awaitSpawnWorkerUnload = true;

        this._dispatchMessage(
          targetManagedWorker.worker,
          WorkerLifecycleEvents.bootstrap,
          {
            workerUrl: targetManagedWorker.url,
            spawnWorkerToken: targetManagedWorker.spawnWorkerToken
          }
        );
        break;
      case WorkerLifecycleEvents.bootstrap_failed:
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.error('Failed to bootstrap the worker.  Stopping the worker', {
          workerId: targetManagedWorker.id,
          workerUrl: targetManagedWorker.url,
          error: lifecycleEvent.msg ? lifecycleEvent.msg.error : null
        });

        this.unload(targetManagedWorker.id);
        break;
      case WorkerLifecycleEvents.bootstrapped:
        targetManagedWorker.phase = WorkerPhase.RUNNING;
        targetManagedWorker.awaitSpawnedWorkerUnload =
          targetManagedWorker.spawnedWorkerUnloadRequested;
        break;
      case WorkerLifecycleEvents.unload_ready:
        if (lifecycleEvent.fromSpawnWorker) {
          targetManagedWorker.spawnWorkerUnloaded = true;
        } else {
          targetManagedWorker.spawnedWorkerUnloaded = true;
        }

        this.unload(targetManagedWorker.id);
        break;
      default:
        // TODO Could split the events into inbound and outboud.
        break;
    }
  }

  private _handleWorkerHostActionEvent(
    hostActionEvent: WorkerClientHostActionEvent,
    targetManagedWorker: ManagedWorker
  ): void {
    switch (hostActionEvent.actionType) {
      case WorkerToHostMessageTypes.toastRequest:
        // TODO need more validation
        // TODO need to fire specific event types and payloads
        this.dispatchEvent(
          // TODO this data is a temp hack
          new CustomEvent(WORKER_MESSAGE_EVENT_TYPE, {
            detail: {
              msgType: WorkerToHostMessageTypes.toastRequest,
              msg: hostActionEvent.msg
            }
          })
        );
        break;
      case WorkerToHostMessageTypes.navRequest:
        // TODO need more validation
        // TODO need to fire specific event types and payloads
        this.dispatchEvent(
          // TODO this data is a temp hack
          new CustomEvent(WORKER_MESSAGE_EVENT_TYPE, {
            detail: {
              msgType: WorkerToHostMessageTypes.navRequest,
              msg: hostActionEvent.msg
            }
          })
        );
        break;
    }
  }

  private _handleWorkerErrorEvent(
    evt: ErrorEvent,
    targetManagedWorker: ManagedWorker
  ) {
    const currentTimestamp = Date.now();

    if (targetManagedWorker.errorWindowStartTimestamp < 0) {
      // First Error
      targetManagedWorker.errorWindowStartTimestamp = currentTimestamp;
      targetManagedWorker.errorWindowCount = 1;
      return;
    }

    const delta = Math.max(
      currentTimestamp - targetManagedWorker.errorWindowStartTimestamp,
      0
    );
    if (delta > this._errorWindowMillis) {
      // Window expired; start new window
      targetManagedWorker.errorWindowStartTimestamp = currentTimestamp;
      targetManagedWorker.errorWindowCount = 1;
      return;
    } else {
      targetManagedWorker.errorWindowCount++;

      if (
        targetManagedWorker.errorWindowCount > this._errorWindowCountThreshold
      ) {
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.error('Error rate exceeded.  Stopping the worker', {
          workerDetails: targetManagedWorker,
          errorWindowCount: targetManagedWorker.errorWindowCount,
          errorWindowStartTimestamp:
            targetManagedWorker.errorWindowStartTimestamp,
          errorWindowDurationMillis: delta,
          errorDetails: evt.error
        });

        this.unload(targetManagedWorker.id);
      }
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
