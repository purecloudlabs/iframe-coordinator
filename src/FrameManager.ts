import {
  ClientToHost,
  validate as validateIncoming
} from './messages/ClientToHost';
import {
  HostToClient,
  validate as validateOutgoing
} from './messages/HostToClient';

const IFRAME_STYLE =
  'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';

/**
 * FrameManager is responsible for managing the state of the client iframe.
 * It changes locations in the frame when requested, and handles proxying
 * of postMessage events to and from the client, with verification of
 * the expected client origin.
 */
class FrameManager {
  private _iframe: HTMLIFrameElement;
  private _frameLocation: string;
  private _window: Window;

  constructor(mockWindow?: any) {
    this._window = mockWindow ? mockWindow : window;

    this._frameLocation = 'about:blank';

    this._iframe = this._window.document.createElement('iframe');
    this._iframe.setAttribute('frameborder', '0');
    this._iframe.setAttribute('style', IFRAME_STYLE);
    this._iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  }

  /**
   * Navigates the wrapped iframe to the provided location in a
   * way that does not affect the host application's history.
   * This prevents strange behavior in the forward and back buttons
   * in the browser in certain edge cases.
   *
   * @param newLocation The new location the iframe should show. If `null`,
   * the frame will be directed to 'about:blank'.
   */
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

  /**
   * Sends a message to the client frame via the postMessage API.
   * If the message isn't structured correctly, or the client frame
   * has navigated away from the expected origin, the message will
   * not be sent.
   *
   * @param message The message to send.
   */
  public sendToClient(message: HostToClient) {
    const clientOrigin = this._expectedClientOrigin();
    if (this._iframe.contentWindow) {
      const validated = validateIncoming(message);
      if (validated) {
        this._iframe.contentWindow.postMessage(validated, clientOrigin);
      }
    }
  }

  /**
   * Registers a handler function that will be called when the client frame
   * posts a message to the host. Invalid messages and messages from unexpected
   * origins will not trigger the handler function.
   *
   * @param handler The handler function that processes messages
   */
  public listenToMessages(handler: ((event: ClientToHost) => void)) {
    this._window.addEventListener('message', event => {
      const validated = validateIncoming(event.data);
      if (
        event.origin === this._expectedClientOrigin() &&
        event.source === this._iframe.contentWindow &&
        validated
      ) {
        handler(validated);
      }
    });
  }

  /**
   * Embeds the wrapped iframe in the provided element.
   *
   * @param parent The element to place the iframe inside.
   */
  public embed(parent: HTMLElement) {
    parent.appendChild(this._iframe);
  }

  private _navigateFrame() {
    if (this._iframe.contentWindow) {
      this._iframe.contentWindow.location.replace(this._frameLocation);
    }
  }

  private _expectedClientOrigin(): string {
    try {
      const clientUrl = new URL(
        this._frameLocation,
        this._window.location.href
      );
      return clientUrl.origin;
    } catch (err) {
      return 'about:blank';
    }
  }
}

export default FrameManager;
