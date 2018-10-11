import { Elm } from "../elm/Client.elm";
import { PublicationHandler } from "./types";

interface ToastOptions {
  title?: string;
  custom?: { [x: string]: any };
}

class Client {
  private _worker: ClientProgram;
  private _messageHandlers: Array<PublicationHandler> = [];

  start(): void {
    if (!this._worker) {
      this._worker = Elm.Client.init();
  
      window.addEventListener("message", (event: MessageEvent) => {
        this._worker.ports.fromHost.send({
          origin: event.origin,
          data: event.data
        });
      });
  
      this._worker.ports.toHost.subscribe((message: any) => {
        window.parent.postMessage(message, "*");
      });
  
      this._worker.ports.toClient.subscribe((message: any) => {
        if (message.msgType == "publish") {
          this._messageHandlers.forEach(handler => {
            handler(message.msg);
          });
        }
      });
  
      window.addEventListener("click", event => {
        let target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === "a" && event.button == 0) {
          event.preventDefault();
          let a = event.target as HTMLAnchorElement;
          this._sendMessage("navRequest", a.href);
        }
      });
    }
  }

  _sendMessage(type: string, data: any): void {
    this._worker.ports.fromClient.send({
      msgType: type,
      msg: data
    });
  }

  subscribe(topic: string): void {
    this._sendMessage("subscribe", topic);
  }

  unsubscribe(topic: string): void {
    this._sendMessage("unsubscribe", topic);
  }

  publish(topic: string, data: any): void {
    this._sendMessage("publish", {
      topic: topic,
      payload: data
    });
  }

  onPubsub(callback: PublicationHandler): void {
    this._messageHandlers.push(callback);
  }

  /**
   * Request a toast message be displayed by the host.
   *
   * The page embedding the host is responsible for handling the fired custom event and
   * presenting/styling the toast.  Application-specific concerns such as level, TTLs,
   * ids for action callbacks (toast click, toast action buttons), etc. can be passed via an object
   * as the custom property of the options param.
   *
   * @param {string} message - The message content of the toast
   * @param {object=} options - Supplimental toast options.
   * @param {string=} options.title - Optional title for the toast.
   * @param {object=} options.custom - Optional, application-specific toast properties.  Note: Properties must be JSON serializable.
   *
   * @example
   * worker.requestToast('Hello world');
   *
   * @example
   * worker.requestToast('World', {title: 'Hello'});
   *
   * @example
   * worker.requestToast('World', {title: 'Hello', custom: {ttl: 5, level: 'info'}});
   */
  requestToast(
    message: string,
    { title = null, custom = null }: undefined | ToastOptions = {}
  ): void {
    this._sendMessage("toastRequest", {
      title,
      message,
      custom
    });
  }
}

const client = new Client();
export default client;