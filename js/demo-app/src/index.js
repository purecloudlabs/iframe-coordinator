import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";
import coordinator from "iframe-coordinator/host.js";

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
