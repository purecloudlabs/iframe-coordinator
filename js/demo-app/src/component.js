import component from "iframe-coordinator/client.js";

component.start();

document.getElementById("path").innerHTML = window.location.hash;

window.onhashchange = function () {
  document.getElementById("path").innerHTML = window.location.hash;
};
