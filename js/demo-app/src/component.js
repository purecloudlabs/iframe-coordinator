import iframeClient from "iframe-coordinator/client.js";

document.getElementById("path").innerHTML = window.location.hash;

window.onhashchange = function() {
  document.getElementById("path").innerHTML = window.location.hash;
};

// Start intercepting link click events for routing
iframeClient.start();

document.getElementById("do-publish").addEventListener("click", () => {
  //Get the topic and the data to publish from the form
  let topic = document.getElementById("pub-topic").value;
  let data = JSON.parse(document.getElementById("pub-data").value);

  //Publish the data
  iframeClient.publish(topic, data);
});
