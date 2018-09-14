import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";
import coordinator from "iframe-coordinator/host.js";
import toastada from "toastada";

const TOAST_LEVELS = ['info', 'success', 'error']

coordinator.registerElements();

document.getElementById("router").registerClients({
  client1: {
    url: "//components/example1/",
    assignedRoute: "/one"
  },
  client2: {
    url: "//components/example2/",
    assignedRoute: "/two"
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Set up Toast Messages
  window.toastada.setOptions({
      prependTo: document.querySelector('root-container'),
      lifeSpan: 5000,
      position: 'top-right',
      animate: false,
      animateDuration: 0
  });

  document.querySelector('frame-router').addEventListener('toastRequest', ({ detail:msgPayload }) => {
    let toastLevel = null;
    if (msgPayload && msgPayload.custom) {
      toastLevel = msgPayload.custom.level;
      if (TOAST_LEVELS.indexOf(toastLevel) === -1) {
        console.error('Received unknown toast level', toastLevel);
        toastLevel = null; 
      }
    }
    toastLevel = toastLevel || TOAST_LEVELS[0];

    // Note: In production, we would sanitize this provided content
    let toastHtml = '';
    if (msgPayload.title && msgPayload.title.trim().length > 0) {
      toastHtml += `<div class="title">${msgPayload.title}</div>`;
    }
    toastHtml += `<div class="msg">${msgPayload.message}</div>`; 

    window.toastada[toastLevel](toastHtml);
  });
})
