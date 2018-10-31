export const WORKER_MESSAGING_PROTOCOL_NAME: string =
  'iframe-coordinator/workers';

export const enum WorkerLifecycleEvents {
  loaded = 'loaded',
  bootstrap = 'bootstrap',
  bootstrap_failure = 'bootstrap_failure',
  bootstrapped = 'bootstrapped',
  shut_down = 'shut_down'
}
