// Load polyfills required for IE11
import "@babel/polyfill";
import "custom-event-polyfill";
import "url-polyfill";
import { registerCustomElements, Client } from "iframe-coordinator";

registerCustomElements();

document.getElementById("path").innerHTML = window.location.hash;

window.onhashchange = function () {
  document.getElementById("path").innerHTML = window.location.hash;
  document.getElementById("urlFromClientPath").innerHTML =
    iframeClient.urlFromClientPath(window.location.hash);
};

/****  SET UP THE IFRAME CLIENT LIBRARY ****/

let iframeClient = new Client({
  // This lets the example client work with the cli host by setting it's domain
  // as a valid host origin to post messages to. A production app will probably
  // need to conditionally set this.
  hostOrigin: `http://${window.location.hostname}:3000`,
});

iframeClient.registerCustomElements();

// Add a listener that will handle config data passed from the host to the
// client at startup.
iframeClient.addListener("environmentalData", (envData) => {
  // Transform link URLs to match top-level app.
  transformLinks();

  const appLocale = envData.locale;
  const now = new Date();
  const localizedDate = new Intl.DateTimeFormat(appLocale).format(now);
  console.log(
    `Got locale from host. Current date formatted for ${envData.locale} is: ${localizedDate}`,
  );
  document.getElementById("urlFromClientPath").innerHTML =
    iframeClient.urlFromClientPath(window.location.hash);
  displayEnvData(envData);
});

// Listen for published events from the host on the `host.topic` topic
// and log them.
iframeClient.messaging.addListener("host.topic", (publication) => {
  console.log("Got Publish event:", publication);
});

// Initialized the client
iframeClient.start();
// Intercept links for messaging
iframeClient.startInterceptingLinks();

/**** SET UP THE CLIENT UI ****/

// The publication handler controls are used to send pub-sub messages to
// the host
document.getElementById("do-publish").addEventListener("click", () => {
  //Get the topic and the data to publish from the form
  let topic = document.getElementById("pub-topic").value;
  let data = JSON.parse(document.getElementById("pub-data").value);

  //Publish the data
  iframeClient.publish({
    topic: topic,
    payload: data,
  });
});

// Set up a controls to trigger notifications in the host app
const TOAST_LEVELS = ["info", "success", "error"];

document.addEventListener("DOMContentLoaded", () => {
  let metadata = {
    title: document.querySelector("h1").innerText,
    breadcrumbs: [
      {
        text: document.querySelector("h1").innerText,
        href: window.location.href,
      },
    ],
    custom: undefined,
  };

  iframeClient.sendPageMetadata(metadata);

  let toastBtnEl = document.querySelector("button.toast");
  toastBtnEl.addEventListener("click", () => {
    let toast = {
      title: "Hello iframe World",
      message: `From ${toastBtnEl.getAttribute("data-component-name")}`,
      // Custom, App-specific props go here. We set a random severity level.
      custom: {
        level: TOAST_LEVELS[Math.round(Math.random() * 2)],
      },
    };
    // Ask the host app to show the toast.
    iframeClient.requestNotification(toast);
  });

  // Ask host app to display prompt on leave request.
  let promptBtnEl = document.querySelector("button.prompt");
  promptBtnEl.addEventListener("click", () => {
    iframeClient.requestPromptOnLeave();
  });

  //Ask host app to clear prompt on leave request.
  let clearPromptBtnEl = document.querySelector("button.clearPrompt");
  clearPromptBtnEl.addEventListener("click", () => {
    iframeClient.clearPromptOnLeave();
  });
});

// HELPER FUNCTIONS
function transformLinks() {
  document.querySelectorAll("a.client-transform-link").forEach((link) => {
    link.href = iframeClient.urlFromClientPath(link.getAttribute("href"));
  });
  document.querySelectorAll("a.host-transform-link").forEach((link) => {
    link.href = iframeClient.urlFromHostPath(link.getAttribute("href"));
  });
}

function displayEnvData(envData) {
  document.getElementById("env-data").innerHTML = JSON.stringify(
    envData,
    null,
    2,
  );
}
