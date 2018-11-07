export const WORKER_MESSAGING_PROTOCOL_NAME: string =
  'iframe-coordinator/workers';

export const enum WorkerToHostMessageTypes {
  NavRequest = 'navRequest',
  ToastRequest = 'toastRequest'
}

export const enum WorkerLifecycleEvents {
  loaded = 'loaded',
  bootstrap = 'bootstrap',
  bootstrap_failed = 'bootstrap_failed',
  bootstrapped = 'bootstrapped',
  before_unload = 'before_unload',
  unload_ready = 'unload_ready'
}
