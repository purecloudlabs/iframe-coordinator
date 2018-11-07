import {
  WORKER_MESSAGING_PROTOCOL_NAME,
  WorkerLifecycleEvents
} from './constants';

const ctx: Worker = self as any;
let spawnWorkerToken: string = null;

ctx.addEventListener('message', handleHostMessage);

function handleHostMessage(evt: MessageEvent) {
  if (evt && evt.data && evt.data.protocol === WORKER_MESSAGING_PROTOCOL_NAME) {
    switch (evt.data.msgType) {
      case WorkerLifecycleEvents.bootstrap:
        try {
          spawnWorkerToken = evt.data.spawnWorkerToken;
          importScripts(evt.data.workerUrl);
          _sendMessageToHost(WorkerLifecycleEvents.bootstrapped);
        } catch (error) {
          _sendMessageToHost(WorkerLifecycleEvents.bootstrap_failed, {
            error: error ? error.toString() : 'No Error Details'
          });
        }
        break;
      case WorkerLifecycleEvents.before_unload:
        ctx.removeEventListener('message', handleHostMessage);
        _sendMessageToHost(WorkerLifecycleEvents.unload_ready);
        break;
      default:
        // No logging needed here; Other messages may be handled by the worker itself
        break;
    }
  }
}

function _sendMessageToHost(msgType: string, payload: object = {}) {
  ctx.postMessage({
    protocol: WORKER_MESSAGING_PROTOCOL_NAME,
    msgType,
    msg: Object.assign({}, payload, {
      spawnWorkerToken
    })
  });
}

_sendMessageToHost(WorkerLifecycleEvents.loaded);

export default null as any;
