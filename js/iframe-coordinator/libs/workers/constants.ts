export const WORKER_MESSAGING_PROTOCOL_NAME: string =
  'iframe-coordinator/workers';

export enum WorkerToHostMessageTypes {
  navRequest = 'navRequest',
  toastRequest = 'toastRequest'
}

export enum WorkerLifecycleEvents {
  loaded = 'loaded',
  bootstrap = 'bootstrap',
  bootstrap_failed = 'bootstrap_failed',
  bootstrapped = 'bootstrapped',
  before_unload = 'before_unload',
  unload_ready = 'unload_ready'
}

export enum WorkerClientEventType {
  LIFECYCLE,
  HOST_ACTION
}

export type WorkerClientEvent =
  | WorkerClientLifecycleEvent
  | WorkerClientHostActionEvent;

export interface WorkerClientBaseEvent {
  kind: WorkerClientEventType;
  targetWorker: Worker;
  msg: any; // TODO Need better fidelity
}

export interface WorkerClientLifecycleEvent extends WorkerClientBaseEvent {
  kind: WorkerClientEventType.LIFECYCLE;
  lifecycleEventType: WorkerLifecycleEvents;
  fromSpawnWorker: boolean;
}

export interface WorkerClientHostActionEvent extends WorkerClientBaseEvent {
  kind: WorkerClientEventType.HOST_ACTION;
  actionType: WorkerToHostMessageTypes;
}
