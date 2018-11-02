import {
  HostToClient,
  validate as validateOutgoing
} from '../messages/HostToClient';
import {
  ClientToHost,
  validate as validateIncoming
} from '../messages/ClientToHost';

const IFRAME_STYLE =
  'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';

class IframeManager {
  private _iframe: HTMLIFrameElement;
  private _frameLocation: string;

  constructor() {
    this._frameLocation = 'about:blank';

    this._iframe = document.createElement('iframe');
    this._iframe.setAttribute('frameborder', '0');
    this._iframe.setAttribute('style', IFRAME_STYLE);
    this._iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  }

  public setFrameLocation(newLocation: string | null) {
    this._frameLocation = newLocation || 'about:blank';
    if (this._iframe.contentWindow) {
      this._navigateFrame();
    } else {
      // Handle the case where the frame isn't ready yet.
      this._iframe.onload = event => {
        this._navigateFrame();
        this._iframe.onload = null;
      };
    }
  }

  public sendtoClient(message: HostToClient) {
    const clientOrigin = this.expectedClientOrigin();
    if (this._iframe.contentWindow) {
      const validated = validateIncoming(message);
      if (validated) {
        this._iframe.contentWindow.postMessage(validated, clientOrigin);
      }
    }
  }

  public expectedClientOrigin(): string {
    try {
      const clientUrl = new URL(this._frameLocation, window.location.href);
      return clientUrl.origin;
    } catch (err) {
      return 'about:blank';
    }
  }

  public listenToMessages(handler: ((event: ClientToHost) => void)) {
    window.addEventListener('message', event => {
      let validated = validateIncoming(event.data);
      if (
        event.origin == this.expectedClientOrigin() &&
        event.source == this._iframe.contentWindow &&
        validated
      ) {
        handler(validated);
      }
    });
  }

  public embed(parent: HTMLElement) {
    parent.appendChild(this._iframe);
  }

  private _navigateFrame() {
    if (this._iframe.contentWindow) {
      this._iframe.contentWindow.location.replace(this._frameLocation);
    }
  }
}

export default IframeManager;
