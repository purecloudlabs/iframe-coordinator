import { Host } from "../elm/Host.elm";
import { LabeledMsg } from "../libs/types";

const ROUTE_ATTR = "route";

interface SubscribeHandler {
  (msg: LabeledMsg): void;
}

const TOAST_REQUEST_MSG_TYPE = 'toastRequest';
const TOAST_REQUEST_EVENT_TYPE = 'toastRequest';
const NAV_REQUEST_MSG_TYPE = 'navRequest';
const NAV_REQUEST_EVENT_TYPE = 'navRequest';

interface Host {
  ports: {
    fromClient: {
      send: (message) => void;
    };
    fromHost: {
      send: (message) => void;
    };
    toHost: {
      subscribe(SubscribeHandler): void;
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

  static get observedAttributes() {
    return [ROUTE_ATTR];
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
      } else if (labeledMsg.msgType === NAV_REQUEST_MSG_TYPE) {
        let event = new CustomEvent(NAV_REQUEST_EVENT_TYPE, { detail: labeledMsg.msg });
        this.dispatchEvent(event);
      } else {
        console.error('Unexpected Message from Host Program', labeledMsg.msgType);
      }
    });

    this.router.ports.toHost.subscribe(message => {
      if (message.msgType === "navRequest") {
        let event = new CustomEvent("navRequest", { detail: message.msg });
        this.dispatchEvent(event);
      }
    });
  }

  changeRoute (location) {
    this.router.ports.fromHost.send({
      msgType: "navRequest",
      msg: location
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if ((name === ROUTE_ATTR) && (oldValue !== newValue)) {
      let location = {
        href: '',
        host: '',
        hostname: '',
        protocol: '',
        origin: '',
        port: '',
        pathname: '',
        search: '',
        hash: newValue,
        username: '',
        password: ''
      };
      this.changeRoute(location);
    }
  }
}

export default FrameRouterElement;
