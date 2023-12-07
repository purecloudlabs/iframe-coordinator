import {
  ClientToHost,
  validate as validateIncoming,
} from "./messages/ClientToHost";
import {
  HostToClient,
  validate as validateOutgoing,
} from "./messages/HostToClient";
import {
  API_PROTOCOL,
  applyHostProtocol,
  PartialMsg,
} from "./messages/LabeledMsg";

const IFRAME_STYLE = "frame-router iframe { width: 100%; height: 100%; }";

/** @internal default iframe sandbox attributes */
const DEFAULT_SANDBOX = [
  "allow-popups-to-escape-sandbox",
  "allow-scripts",
  "allow-same-origin",
  "allow-modals",
  "allow-forms",
  "allow-popups",
  "allow-downloads",
  "allow-top-navigation-by-user-activation",
] as const;

let style: HTMLElement;

/**
 * A handler function for messages sent from a client app.
 */
type MessageHandler = (event: ClientToHost) => void;

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
  private _postMessageHandler: (event: MessageEvent) => void;

  constructor(options: {
    /** Handler for frame messages */
    onMessage: MessageHandler;
    /** Optional mock window for testing */
    mockWindow?: Window;
  }) {
    this._window = options.mockWindow ? options.mockWindow : window;
    this._postMessageHandler = (event) => {
      this._handlePostMessage(options.onMessage, event);
    };

    this._frameLocation = "about:blank";

    this._iframe = this._window.document.createElement("iframe");
    this._iframe.setAttribute("frameborder", "0");

    if (!style) {
      style = this._window.document.createElement("style");
      style.innerText = IFRAME_STYLE;
      this._window.document.head.appendChild(style);
    }

    this._iframe.setAttribute("sandbox", DEFAULT_SANDBOX.join(" "));
  }

  /**
   * String of feature-policies to set on the iframe element.
   *  Ex: "microphone *;"
   *
   *  See [feature-policies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy#Directives)
   *
   * @param allow string of feature-policies
   */
  public setFrameAllow(allow?: string): void {
    if (typeof allow !== "string") {
      allow = "";
    }
    this._iframe.setAttribute("allow", allow);
  }

  /**
   * String of sandbox rules to be added to the `<iframe>` element.
   *  Ex: "allow-forms allow-modals"
   *
   *  See [<iframe>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
   *
   * @param sandbox string of iframe sandbox rules
   */
  public setFrameSandbox(sandbox?: string): void {
    if (typeof sandbox !== "string") {
      sandbox = "";
    }
    const arrSandbox = sandbox.split(" ").concat(DEFAULT_SANDBOX);
    const newSandbox = [...new Set(arrSandbox)].join(" ");
    this._iframe.setAttribute("sandbox", newSandbox);
  }

  /**
   * String for the default `title` attribute to be added to the <iframe> element
   * Ex: "Manage Preferences"
   *
   * See [<iframe> Accessibility Concerns](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#accessibility_concerns)
   *
   * @param defaultTitle String for the `title` attribute added to the `<iframe>` element.
   */
  public setFrameDefaultTitle(defaultTitle?: string): void {
    if (typeof defaultTitle !== "string") {
      defaultTitle = "";
    }
    this._iframe.setAttribute("title", defaultTitle);
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
  public setFrameLocation(newLocation?: string | null | undefined): string {
    this._frameLocation = newLocation || "about:blank";
    if (this._iframe.contentWindow) {
      this._navigateFrame();
    } else {
      // Handle the case where the frame isn't ready yet.
      this._iframe.onload = (event) => {
        this._navigateFrame();
        this._iframe.onload = null;
      };
    }
    // Let the caller know where the frame ended up
    return this._frameLocation;
  }

  /**
   * Sends a message to the client frame via the postMessage API.
   * If the message isn't structured correctly, or the client frame
   * has navigated away from the expected origin, the message will
   * not be sent.
   *
   * @param message The message to send.
   */
  public sendToClient<T, V>(partialMsg: PartialMsg<T, V>) {
    const clientOrigin = this._expectedClientOrigin();
    if (this._iframe.contentWindow && clientOrigin) {
      const message = applyHostProtocol(partialMsg);
      let validated: HostToClient;

      try {
        validated = validateOutgoing(message);
      } catch (e) {
        throw new Error(
          `
I received invalid data to send to a client application. This is probably due
to bad data passed to a frame-router method.
`.trim() +
            "\n" +
            e.message,
        );
      }

      this._iframe.contentWindow.postMessage(validated, clientOrigin);
    }
  }

  /**
   * Starts listening to postMessages from the client window.
   */
  public startMessageHandler() {
    this._window.addEventListener("message", this._postMessageHandler);
  }

  /**
   * Stops listening to postMessages from the client window.
   */
  public stopMessageHandler() {
    this._window.removeEventListener("message", this._postMessageHandler);
  }

  /**
   * Embeds the wrapped iframe in the provided element.
   *
   * @param parent The element to place the iframe inside.
   */
  public embed(parent: HTMLElement) {
    const frameId = parent.getAttribute("frame-id");
    if (frameId) {
      this._iframe.setAttribute("id", frameId);
    }
    parent.appendChild(this._iframe);
  }

  private _handlePostMessage(handler: MessageHandler, event: MessageEvent) {
    let validated = null;

    if (event.data && event.data.direction === "HostToClient") {
      return;
    }

    try {
      validated = validateIncoming(event.data);
    } catch (e) {
      if (event.data.protocol === API_PROTOCOL) {
        throw new Error(
          `
I received an invalid message from the client application. This is probably due
to a major version mismatch between client and host iframe-coordinator libraries.
      `.trim() +
            "\n" +
            e.message,
        );
      } else {
        return;
      }
    }

    const expectedClientOrigin = this._expectedClientOrigin();
    if (
      expectedClientOrigin &&
      event.origin === expectedClientOrigin &&
      event.source === this._iframe.contentWindow
    ) {
      if (validated.msgType === "clickFired") {
        /** Simulate a click on the iframe when a click is reported from the client.
         * This allows a click event to bubble through the host to provide expected behaviors for things like dropdowns and modals.
         */
        this._iframe.click();
      }
      handler(validated);
    }
  }

  private _navigateFrame() {
    if (this._iframe.contentWindow) {
      this._iframe.contentWindow.location.replace(this._frameLocation);
    }
  }

  private _expectedClientOrigin(): string | null {
    try {
      const clientUrl = new URL(
        this._frameLocation,
        this._window.location.href,
      );

      // Bail early if it's not an http resource.
      // Ex: file protocol url origin behavior is browser specific
      if (clientUrl.protocol !== "http:" && clientUrl.protocol !== "https:") {
        return null;
      }

      // Assert that this origin is actually valid.
      // Ex: about:blank, chrome:version, extensions, etc will return 'null'
      return new URL(clientUrl.origin).origin;
    } catch (err) {
      return null;
    }
  }
}

export default FrameManager;
