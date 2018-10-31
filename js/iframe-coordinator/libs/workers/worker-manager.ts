// import [* as] SpawnWorker from "../workers/SpawnWorker.worker.ts";
/* Exporting as a class gets by the typescript check and loads the file, however, the constructor
isn't called.  Also, the umd version of the module can't find the default since the worker-loader
seems to export as a constructor function anyway.  So, the raw text version seems to be the best
approach at this point*/
import {
  WORKER_MESSAGING_PROTOCOL_NAME,
  WorkerLifecycleEvents
} from './constants';
import * as SpawnWorker from './spawn-worker.worker.ts';

export const WORKER_MESSAGE_EVENT_TYPE: string = 'workermessage';

/*
 * TODO for this feature:
 *
 * Is the import of the worker good enough?
  * Decide on class or text of the worker
 * Make sure es6 target is ok
 * Make sure it works in IE
 *  check blob and fallback
 * get bi-directional comms working
 * Decide on api to configure workers
 * Deal with lenient shutdown?
 * Improve worker demo for the real, useful demo
 * Docs and tests
 *   dont forget that this is sorta dangerous with indexeddb
 * Handle errors from worker
 *  general (error rate?, allow restart)
 * better logging (these are important)
 * decide if i need the protocol in the message payload or not.
 *  check it inbound if so
 *  remove it from outbound if not
 * stronger types of messages between this manager and the workers?
 */

enum WorkerPhase {
  LOADING,
  LOADED,
  BOOTSTRAPPING,
  RUNNING
  // TODO Might want to implement this.  give it a chance to shutdown.  Need a timeout
  // STOPPING
}

interface ManagedWorker {
  id: string;
  url: string;
  phase: WorkerPhase;
  worker: Worker;
}

export default class WorkerManager implements EventListenerObject, EventTarget {
  private static trackedWorkerEventTypes = ['message', 'error'];
  private static evtTargetDelegate: DocumentFragment = null;
  private static ID_PREFIX = 'iframeCoordinatorWorker-';
  private static _workerIndex = 0;
  private _workers: ManagedWorker[];

  constructor() {
    if (WorkerManager.evtTargetDelegate === null) {
      WorkerManager.evtTargetDelegate = document.createDocumentFragment();
    }

    this._workers = [];
  }

  public start(url: string): string {
    const id = `${WorkerManager.ID_PREFIX}${++WorkerManager._workerIndex}`;

    // @ts-ignore
    const worker = new SpawnWorker();
    WorkerManager.trackedWorkerEventTypes.forEach(curr => {
      worker.addEventListener(curr, this);
    });

    this._workers.push({
      id,
      url,
      worker,
      phase: WorkerPhase.LOADING
    });

    return id;
  }

  public stop(idToStop: string) {
    const workerIndexToStop = this._workers.findIndex((curr, index) => {
      return curr.id === idToStop;
    });

    if (workerIndexToStop >= 0) {
      const worker = this._workers[workerIndexToStop].worker;
      WorkerManager.trackedWorkerEventTypes.forEach(curr => {
        worker.removeEventListener(curr, this);
      });
      worker.terminate();

      this._workers.splice(workerIndexToStop, 1);
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
        // TODO Should I be lenient when running?  max error rate?
        // TODO allow restart?
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.error('Error occurred in worker.  Stopping the worker', {
          workerDetails: managedWorker,
          errorDetails: evt.error
        });
        this.stop(managedWorker.id);
      }
    }
  }

  private _onWorkerMsg(evt: MessageEvent) {
    // TODO Check other base fields (protocol, etc)
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
        this._dispatchMessage(
          managedWorker.worker,
          WorkerLifecycleEvents.bootstrap,
          {
            corsWorkerUri: managedWorker.url
          }
        );
        break;
      case WorkerLifecycleEvents.bootstrap_failure:
        // TODO Need to add proper logging support
        // tslint:disable-next-line
        console.error('Failed to bootstrap the worker.  Stopping the worker', {
          workerId: managedWorker.id,
          error: evt.data.msg.error
        });
        this.stop(managedWorker.id);
        break;
      case WorkerLifecycleEvents.bootstrapped:
        managedWorker.phase = WorkerPhase.RUNNING;
        break;
      // TODO Other lifecycle event types (stopping, etc.)
      default:
        // TODO only re-dispatch known messaging event types (navRequest, toastRequest, etc)
        this.dispatchEvent(
          new CustomEvent(WORKER_MESSAGE_EVENT_TYPE, { detail: evt.data })
        );
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
