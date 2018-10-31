import { Elm, Publication } from '../../elm/Host.elm';
import WorkerManager, {
  WORKER_MESSAGE_EVENT_TYPE
} from '../workers/worker-manager';
import ClientFrame from './x-ifc-frame';

const ROUTE_ATTR = 'route';

/**
 * The frame-router custom element
 *
 * Events:
 * @event toastRequest
 * @type {object}
 * @param {object} detail - Details of the toast.
 * @param {string} detail.message - Toast message.
 * @param {string=} detail.title - Optional toast title.
 * @param {object=} detail.x - Optional, custom properties for application-specific toast features
 */
class FrameRouterElement extends HTMLElement {
  public router: HostProgram;
  private _workerMgr: WorkerManager;

  constructor() {
    super();
  }

  static get observedAttributes() {
    return [ROUTE_ATTR];
  }

  public connectedCallback() {
    this.setAttribute('style', 'position: relative;');
  }

  public registerClients(clients: ClientRegistrations) {
    const embedTarget = document.createElement('div');
    this.appendChild(embedTarget);
    this.router = Elm.Host.init({
      flags: clients,
      node: embedTarget
    });

    this._workerMgr = new WorkerManager();
    this._workerMgr.addEventListener(
      WORKER_MESSAGE_EVENT_TYPE,
      (evt: CustomEvent) => {
        if (evt && evt.detail && evt.detail.msgType) {
          switch (evt.detail.msgType) {
            case 'navRequest':
              // TODO Talk about this api.  Should it be route based?
              this.dispatchEvent(
                new CustomEvent(evt.detail.msgType, {
                  detail: { fragment: evt.detail.msg.fragment }
                })
              );
              break;
            case 'toastRequest':
              this.dispatchEvent(
                new CustomEvent(evt.detail.msgType, { detail: evt.detail.msg })
              );
              break;
            // TODO pub/sub, others?
            default:
              // TODO Need to add proper logging support
              // tslint:disable-next-line
              console.error(
                `Unknown msgType ${evt.detail.msgType}, received from worker`
              );
              break;
          }
        }
      }
    );

    // TODO decide on api and start them here
    for (let i = 0; i < 5; i++) {
      this._workerMgr.start('http://localhost:8080/workers/demo-worker.js');
    }
    this._workerMgr.start('http://localhost:8080/workers/failure-worker.js');
    // Tests the 404 case
    this._workerMgr.start(
      'http://localhost:8080/workers/non-existant-worker.js'
    );

    this.router.ports.toHost.subscribe(labeledMsg => {
      this.dispatchEvent(
        new CustomEvent(labeledMsg.msgType, { detail: labeledMsg.msg })
      );
    });

    this.router.ports.toClient.subscribe(message => {
      const frame = this.getElementsByTagName('x-ifc-frame')[0] as ClientFrame;
      if (frame) {
        frame.send(message);
      }
    });
  }

  public subscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msg: topic,
      msgType: 'subscribe'
    });
  }

  public unsubscribe(topic: string): void {
    this.router.ports.fromHost.send({
      msg: topic,
      msgType: 'unsubscribe'
    });
  }

  public publish(publication: Publication): void {
    this.router.ports.fromHost.send({
      msg: publication,
      msgType: 'publish'
    });
  }

  public changeRoute(newPath: string) {
    this.router.ports.fromHost.send({
      msg: newPath,
      msgType: 'routeChange'
    });
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    if (name === ROUTE_ATTR && oldValue !== newValue) {
      this.changeRoute(newValue);
    }
  }
}

export default FrameRouterElement;
