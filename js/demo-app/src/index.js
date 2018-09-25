import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";
import coordinator from "iframe-coordinator/host.js";
import toastada from "toastada";

const TOAST_LEVELS = ["info", "success", "error"];

coordinator.registerElements();

let router = document.getElementById("router");

// Set up client URLs and Routes
router.registerClients({
  client1: {
    url: "//components/example1/",
    assignedRoute: "/one"
  },
  client2: {
    url: "//components/example2/",
    assignedRoute: "/two"
  }
});

// Subscribe to pub-sub events on the topic `publish.topic`
router.subscribe("publish.topic");

// Listen to publication events (will only be emitted for subscribed topics)
router.addEventListener("publish", event => {
  let publication = event.detail;
  console.log(
    `Recieved pub-sub data on topic ${publication.topic}:`,
    publication.payload
  );
});

document.getElementById("publish").addEventListener("click", event => {
  router.publish({
    topic: "host.topic",
    payload: { message: "Hello, Client!" }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Set up Toast Messages
  window.toastada.setOptions({
    prependTo: document.querySelector("root-container"),
    lifeSpan: 5000,
    position: "top-right",
    animate: false,
    animateDuration: 0
  });

  document
    .querySelector("frame-router")
    .addEventListener("toastRequest", ({ detail: msgPayload }) => {
      let toastLevel = null;
      if (msgPayload && msgPayload.custom) {
        toastLevel = msgPayload.custom.level;
        if (TOAST_LEVELS.indexOf(toastLevel) === -1) {
          console.error("Received unknown toast level", toastLevel);
          toastLevel = null;
        }
      }
      toastLevel = toastLevel || TOAST_LEVELS[0];

      // Note: In production, we would sanitize this provided content
      let toastHtml = "";
      if (msgPayload.title && msgPayload.title.trim().length > 0) {
        toastHtml += `<div class="title">${msgPayload.title}</div>`;
      }
      toastHtml += `<div class="msg">${msgPayload.message}</div>`;

      window.toastada[toastLevel](toastHtml);
    });
});
