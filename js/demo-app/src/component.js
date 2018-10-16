import { Client } from "iframe-coordinator/client";

document.getElementById("path").innerHTML = window.location.hash;

window.onhashchange = function() {
  document.getElementById("path").innerHTML = window.location.hash;
};

// Start intercepting link click events for routing
let iframeClient = new Client();
iframeClient.start();

iframeClient.onPubsub(publication => {
  console.log("Got Publish event:", publication);
});
iframeClient.subscribe("host.topic");

document.getElementById("do-publish").addEventListener("click", () => {
  //Get the topic and the data to publish from the form
  let topic = document.getElementById("pub-topic").value;
  let data = JSON.parse(document.getElementById("pub-data").value);

  //Publish the data
  iframeClient.publish(topic, data);
});

const TOAST_LEVELS = ["info", "success", "error"];

document.addEventListener("DOMContentLoaded", () => {
  let toastBtnEl = document.querySelector("button.toast");
  toastBtnEl.addEventListener("click", () => {
    let options = {
      title: "Hello iframe World",
      // Custom, App-specific props here
      custom: {
        level: TOAST_LEVELS[Math.round(Math.random() * 2)]
      }
    };

    iframeClient.requestToast(
      `From ${toastBtnEl.getAttribute("data-component-name")}`,
      options
    );
  });
});
