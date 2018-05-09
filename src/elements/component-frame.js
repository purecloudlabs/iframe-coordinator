const SRC_ATTR = 'src';

const IFRAME_STYLE = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';

export default class ComponentFrame extends HTMLElement {
    static get observedAttributes() {
        return [SRC_ATTR];
    }

    constructor() {
        super();

        this.iframe = document.createElement('iframe');
        this.iframe.setAttribute('frameborder', 0);
        this.iframe.setAttribute('style', IFRAME_STYLE);
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    }

    connectedCallback() {
        if (this.children[0] != this.iframe) {
            this.appendChild(this.iframe);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == SRC_ATTR) {
            if ( !this.iframe.contentWindow ) {
                this.iframe.onload = (event) => {
                    this.updateFrameLoc(null, this.getAttribute('src'));
                    this.iframe.onload = null;
                };
            } else {
                this.updateFrameLoc(oldValue, newValue);
            }
        }
    }

    updateFrameLoc(oldSrc, newSrc) {
        this.iframe.contentWindow.location.replace(newSrc);
    }

    send(message) {
        this.iframe.contentWindow.postMessage(message, '*'); //TODO: Something better than *
    }
}
