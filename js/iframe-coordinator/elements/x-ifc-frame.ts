const SRC_ATTR = "src";

const IFRAME_STYLE =
  "position: absolute; top: 0; left: 0; width: 100%; height: 100%;";

class ClientFrame extends HTMLElement {
  iframe: HTMLIFrameElement;

  static get observedAttributes() {
    return [SRC_ATTR];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.iframe = document.createElement("iframe");
    this.iframe.setAttribute("frameborder", "0");
    this.iframe.setAttribute("style", IFRAME_STYLE);
    this.iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    this.setAttribute("style", IFRAME_STYLE);
    if (this.children[0] != this.iframe) {
      this.appendChild(this.iframe);
    }
    window.addEventListener("message", this.handleClientMessages.bind(this));
    this.syncLocation();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (this.iframe && name == SRC_ATTR) {
      this.updateFrameLoc(newValue);
    }
  }

  /* Syncs the iframe state to the current src attribute */
  syncLocation() {
    this.updateFrameLoc(this.getAttribute("src"));
  }

  updateFrameLoc(newSrc: string) {
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.location.replace(newSrc);
    } else {
      // Handle the case where the frame isn't ready yet.
      this.iframe.onload = event => {
        this.syncLocation();
        this.iframe.onload = null;
      };
    }
  }

  send(message: any) {
    this.iframe.contentWindow.postMessage(message, this.expectedClientOrigin());
  }

  expectedClientOrigin() {
    let clientUrl = new URL(this.getAttribute("src"), window.location.href);
    return clientUrl.origin;
  }

  handleClientMessages(event: MessageEvent) {
    if (
      event.origin === this.expectedClientOrigin() &&
      event.source === this.iframe.contentWindow
    ) {
        //TODO: Update this for IE11 support
      let msgEvent = new CustomEvent("clientMessage", { detail: event.data });
      this.dispatchEvent(msgEvent);
    }
  }
}

export default ClientFrame;
