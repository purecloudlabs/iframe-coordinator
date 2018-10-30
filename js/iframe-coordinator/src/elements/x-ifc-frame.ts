const SRC_ATTR = 'src';

const IFRAME_STYLE =
  'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';

class ClientFrame extends HTMLElement {
  public iframe: HTMLIFrameElement;

  static get observedAttributes() {
    return [SRC_ATTR];
  }

  constructor() {
    super();
  }

  public connectedCallback() {
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('frameborder', '0');
    this.iframe.setAttribute('style', IFRAME_STYLE);
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    this.setAttribute('style', IFRAME_STYLE);
    if (this.children[0] !== this.iframe) {
      this.appendChild(this.iframe);
    }
    window.addEventListener('message', this.handleClientMessages.bind(this));
    this.syncLocation();
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    if (this.iframe && name === SRC_ATTR) {
      this.updateFrameLoc(newValue);
    }
  }

  /* Syncs the iframe state to the current src attribute */
  public syncLocation() {
    const src = this.getAttribute('src');
    if (src != null) {
      this.updateFrameLoc(src);
    }
  }

  public updateFrameLoc(newSrc: string) {
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

  public send(message: any) {
    const clientOrigin = this.expectedClientOrigin();
    if (clientOrigin !== 'null' && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(message, clientOrigin);
    }
  }

  public expectedClientOrigin() {
    const src = this.getAttribute('src');
    if (src != null) {
      const clientUrl = new URL(src, window.location.href);
      return clientUrl.origin;
    } else {
      return 'about:blank';
    }
  }

  public handleClientMessages(event: MessageEvent) {
    if (
      event.origin === this.expectedClientOrigin() &&
      event.source === this.iframe.contentWindow
    ) {
      const msg = {
        detail: event.data
      };

      // TODO: Update this for IE11 support
      const msgEvent = new CustomEvent('clientMessage', msg);
      this.dispatchEvent(msgEvent);
    }
  }
}

export default ClientFrame;
