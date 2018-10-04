import { Elm } from "../elm/Client.elm";
import { PublicationHandler } from "./types";

let worker: ClientProgram = null;
let messageHandlers: Array<PublicationHandler> = [];

//TODO: make this a class, for a more idiomatic API?
export default {
  start: start,

  subscribe(topic: string): void {
    sendMessage("subscribe", topic);
  },

  unsubscribe(topic: string): void {
    sendMessage("unsubscribe", topic);
  },

  publish(topic: string, data: any): void {
    sendMessage("publish", {
      topic: topic,
      payload: data
    });
  },

  onPubsub(callback: PublicationHandler) {
    messageHandlers.push(callback);
  },

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
    sendMessage("toastRequest", {
      title,
      message,
      custom
    });
  }
};

function start() {
  if (!worker) {
    worker = Elm.Client.init();

    window.addEventListener("message", (event: MessageEvent) => {
      worker.ports.fromHost.send({
        origin: event.origin,
        data: event.data
      });
    });

    worker.ports.toHost.subscribe((message: any) => {
      window.parent.postMessage(message, "*");
    });

    worker.ports.toClient.subscribe((message: any) => {
      if (message.msgType == "publish") {
        messageHandlers.forEach(handler => {
          handler(message.msg);
        });
      }
    });

    window.addEventListener("click", event => {
      let target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === "a" && event.button == 0) {
        event.preventDefault();
        let a = event.target as HTMLAnchorElement;
        sendMessage("navRequest", a.href);
      }
    });
  }
}

function sendMessage(type: string, data: any) {
  worker.ports.fromClient.send({
    msgType: type,
    msg: data
  });
}

interface ToastOptions {
  title?: string;
  custom?: { [x: string]: any };
}
