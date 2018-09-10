const SRC_ATTR = "src";

const IFRAME_STYLE =
  "position: absolute; top: 0; left: 0; width: 100%; height: 100%;";

class ComponentFrame extends HTMLElement {
  iframe: HTMLIFrameElement;

  static get observedAttributes() {
    return [SRC_ATTR];
  }

  constructor() {
    super();
    this.iframe = document.createElement("iframe");
    this.iframe.setAttribute("frameborder", "0");
    this.iframe.setAttribute("style", IFRAME_STYLE);
    this.iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  }

  connectedCallback() {
    this.setAttribute("style", IFRAME_STYLE);
    if (this.children[0] != this.iframe) {
      this.appendChild(this.iframe);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name == SRC_ATTR) {
      if (!this.iframe.contentWindow) {
        this.iframe.onload = event => {
          this.updateFrameLoc(this.getAttribute("src"));
          this.iframe.onload = null;
        };
      } else {
        this.updateFrameLoc(newValue);
      }
    }
  }

  updateFrameLoc(newSrc: string) {
    this.iframe.contentWindow.location.replace(newSrc);
  }

  send(message: any) {
    this.iframe.contentWindow.postMessage(message, "*"); //TODO: Something better than *
  }
}

export default ComponentFrame;
