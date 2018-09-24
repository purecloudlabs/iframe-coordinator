import { Host } from "../elm/Host.elm";

const TOAST_REQUEST_MSG_TYPE = 'toastRequest';
const TOAST_REQUEST_EVENT_TYPE = 'toastRequest';

interface Host {
  ports: {
    fromClient: {
      send: (message) => void;
    };
    toHost: {
      subscribe: (callback: (message) => void) => void;
    };
  };
}

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
  router: Host;

  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute("style", "position: relative;");
  }

  registerClients(clients) {
    this.router = Host.embed(this, clients);

    window.addEventListener("message", event => {
      this.router.ports.fromClient.send(event.data);
    });

    // Subscribe to component out port to handle messages 
    this.router.ports.toHost.subscribe(labeledMsg => {
      if (labeledMsg.msgType === TOAST_REQUEST_MSG_TYPE) {
        this.dispatchEvent(new CustomEvent(TOAST_REQUEST_EVENT_TYPE, {detail: labeledMsg.msg}));
      } else {
        console.error('Unexpected Message from Host Program', labeledMsg.msgType);
      }
    });
  }
}

export default FrameRouterElement;
