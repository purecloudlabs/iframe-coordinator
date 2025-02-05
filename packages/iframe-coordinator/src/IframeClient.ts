import { AbstractClient } from "./AbstractClient";
import { EnvData, KeyData } from "./client";
import IfcClientLinkElement from "./elements/ifc-client-link";
import IfcHostLinkElement from "./elements/ifc-host-link";
import { keyEqual } from "./Key";
import { ClientToHost } from "./messages/ClientToHost";

/**
 * Client configuration options.
 */
export interface ClientConfigOptions {
  /** The expected origin of the host application. Messages will not be sent to other origins. */
  hostOrigin?: string;
}

export class IframeClient extends AbstractClient<Window> {
  private _registeredKeys: KeyData[] = [];
  private _shouldInterceptLinks: boolean = false;

  public constructor(configOptions?: ClientConfigOptions) {
    super();
    this._globalContext = window;
    if (configOptions && configOptions.hostOrigin) {
      this._hostOrigin = configOptions.hostOrigin;
    } else {
      this._hostOrigin = self.origin;
    }
  }

  public start(): void {
    super.start();
    this._globalContext.addEventListener("keydown", this._onKeyDown);
    this._globalContext.addEventListener("click", this._onWindowClick);
  }

  public stop(): void {
    super.stop();
    this._globalContext.removeEventListener("keydown", this._onKeyDown);
    this._globalContext.removeEventListener("click", this._onWindowClick);
    this.stopInterceptingLinks();
  }

  /**
   * Registers custom elements used by the client application
   */
  public registerCustomElements(): void {
    const clientInstance = this;
    /**
     * This class extends IfcClientLinkElement to provide
     * the ifc-client-link custom element access to the client instance
     */
    class IfcClientLinkElementComplete extends IfcClientLinkElement {
      constructor() {
        super(clientInstance);
      }
    }
    /**
     * This class extends IfcHostLinkElement to provide
     * the ifc-host-link custom element access to the client instance
     */
    class IfcHostLinkElementComplete extends IfcHostLinkElement {
      constructor() {
        super(clientInstance);
      }
    }
    clientInstance.addListener("environmentalData", (envData) => {
      customElements.define("ifc-client-link", IfcClientLinkElementComplete);
      customElements.define("ifc-host-link", IfcHostLinkElementComplete);
    });
  }

  /**
   * Allows the click handler on the client window to intercept clicks on anchor elements
   * and makes a nav request to the host based on the element's href. This should be
   * avoided for complex applications as it can interfere with things like download
   * links that you may not want to intercept.
   */
  public startInterceptingLinks(): void {
    this._shouldInterceptLinks = true;
  }

  /**
   * Turns off the behavior of intercepting link clicks in the client window click handler.
   */
  public stopInterceptingLinks(): void {
    this._shouldInterceptLinks = false;
  }

  protected _postMessage(message: ClientToHost): void {
    this._globalContext.parent.postMessage(message, this._hostOrigin);
  }

  protected _onEnvironmentData(envData: EnvData): void {
    if (envData.registeredKeys) {
      envData.registeredKeys.forEach((keyData) => {
        const options = {
          alt: keyData.altKey,
          ctrl: keyData.ctrlKey,
          shift: keyData.shiftKey,
          meta: keyData.metaKey,
        };

        if (options.alt || options.ctrl || options.meta) {
          this._registeredKeys.push(keyData);
        }
      });
    }
  }

  private _onWindowClick = (event: MouseEvent) => {
    this._sendToHost({ msgType: "clickFired", msg: {} });

    if (this._shouldInterceptLinks) {
      this._interceptLink(event);
    }
  };

  private _interceptLink = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === "a" && event.button === 0) {
      event.preventDefault();
      const a = event.target as HTMLAnchorElement;
      const url = new URL(a.href);
      this._sendToHost({
        msgType: "navRequest",
        msg: {
          url: url.toString(),
        },
      });
    }
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this._registeredKeys) {
      return;
    }

    const shouldSend = this._registeredKeys.some((key: KeyData) =>
      keyEqual(key, event),
    );
    if (!shouldSend) {
      return;
    }

    this._sendToHost({
      msgType: "registeredKeyFired",
      msg: {
        altKey: event.altKey,
        charCode: event.charCode,
        code: event.code,
        ctrlKey: event.ctrlKey,
        key: event.key,
        keyCode: event.keyCode,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      },
    });
  };
}
