import {
  WORKER_MESSAGING_PROTOCOL_NAME,
  WorkerLifecycleEvents
} from './constants';

const ctx: Worker = self as any;

ctx.addEventListener('message', evt => {
  if (evt && evt.data && evt.data.protocol === WORKER_MESSAGING_PROTOCOL_NAME) {
    switch (evt.data.msgType) {
      case WorkerLifecycleEvents.bootstrap:
        try {
          importScripts(evt.data.corsWorkerUri);
          ctx.postMessage({
            protocol: WORKER_MESSAGING_PROTOCOL_NAME,
            msgType: WorkerLifecycleEvents.bootstrapped
          });
        } catch (error) {
          ctx.postMessage({
            protocol: WORKER_MESSAGING_PROTOCOL_NAME,
            msgType: WorkerLifecycleEvents.bootstrap_failure,
            msg: {
              error: error ? error.toString() : 'No Error Details'
            }
          });
        }
        break;
      default:
        // No logging needed here; Other messages may be handled by the worker itself
        break;
    }
  }
});

ctx.postMessage({
  protocol: WORKER_MESSAGING_PROTOCOL_NAME,
  msgType: WorkerLifecycleEvents.loaded
});

export default null as any;
