import "@babel/polyfill";
import "custom-event-polyfill/polyfill.js";
import "nodelist-foreach-polyfill";
import "url-polyfill";
import "@webcomponents/custom-elements/src/native-shim.js";
import "@webcomponents/custom-elements/src/custom-elements.js";
import { registerElements } from "iframe-coordinator/host";
import "toastada";

const TOAST_LEVELS = ["info", "success", "error"];
const TOP_ROUTE_EXTRACTOR = /^#?(\/[^\/]+).*/;
const NAV_CONFIGS = [
  {
    id: "client1",
    title: "Component 1",
    url: new URL("/components/example1/#/", window.location).toString(),
    assignedRoute: "/one",
    children: ["first", "second"]
  },
  {
    id: "client2",
    title: "Component 2",
    url: new URL("/components/example2/#/", window.location).toString(),
    assignedRoute: "/two",
    children: ["first", "second"]
  },
  {
    id: "wikipedia",
    title: "Wikipedia",
    url: new URL("https://en.wikipedia.org").toString(),
    assignedRoute: "/wikipedia",
    children: []
  }
];

let urlRoutingEnabled = false;

// ----- Env Setup

registerElements();

// ----- Client/Nav Setup

let router = document.getElementById("router");
router.setupFrames(
  NAV_CONFIGS.reduce((clientMap, { id, url, assignedRoute }) => {
    clientMap[id] = {
      url,
      assignedRoute
    };

    return clientMap;
  }, {}),
  {
    locale: "nl-NL",
    language: 'nl',
    hostRootUrl: window.location.origin
  }
);

buildNavMarkup(NAV_CONFIGS);

// ----- Pub-Sub Setup

// Subscribe to pub-sub events on the topic `publish.topic`
router.messaging.addListener("publish.topic", publication => {
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
  // ----- Routing Setup
  document
    .querySelector("button.url-routing.toggle-switch")
    .addEventListener("click", toggleRouting);

  window.onhashchange = function() {
    if (urlRoutingEnabled) {
      // On hash change & routing mode, update route attribute
      setRoute(window.location.hash.slice(1));
      updateActiveNav();
    }
  };

  document
    .getElementById("router")
    .addEventListener("navRequest", function(data) {
      let requestedUrl = new URL(data.detail.url);
      let requestedRoute = requestedUrl.hash.substr(1);
      if (urlRoutingEnabled) {
        location.hash = requestedUrl.hash;
        // On navRequest & routing mode, change url
      } else {
        setRoute(requestedRoute);
        updateActiveNav(requestedRoute);
      }
    });

  // ----- Toast Message Setup
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

  // ----- Initialize State
  // Turn on URL Routing by default
  toggleRouting();
  // Set a default route; if needed
  if (!window.location.hash) {
    window.location.hash = NAV_CONFIGS[0].assignedRoute;
  }
});

// ----- Helpers

// Routing helpers

function setRoute(route) {
  document.getElementById("router").setAttribute("route", route);
}

function toggleRouting() {
  urlRoutingEnabled = !urlRoutingEnabled;

  if (urlRoutingEnabled) {
    updateActiveNav();
  } else {
    location.hash = "";
  }

  // Update UI
  document
    .querySelector("button.url-routing.toggle-switch")
    .setAttribute("aria-checked", urlRoutingEnabled);
  document.querySelector(
    "header nav ul.nav-menu"
  ).style.display = urlRoutingEnabled ? "flex" : "none";
  document.querySelector(
    "header nav ul.programmatic-nav"
  ).style.display = urlRoutingEnabled ? "none" : "flex";
}

// UI Helpers
function buildNavMarkup(navConfigs) {
  let navMenu = document.querySelector("header nav ul.nav-menu");
  let programmaticNav = document.querySelector(
    "header nav ul.programmatic-nav"
  );

  navConfigs.forEach(curr => {
    // Build Nav Menu Item
    let currLi = document.createElement("li");
    currLi.setAttribute("class", `nav-id-${curr.id}`);

    let currLink = document.createElement("a");
    currLink.setAttribute("class", `nav-id-${curr.id}`);
    currLink.setAttribute("href", `#${curr.assignedRoute}`);
    currLink.appendChild(document.createTextNode(curr.title));

    currLi.appendChild(currLink);
    // TODO: Build sub-navigation with children

    navMenu.appendChild(currLi);

    // Build Programmatic Button
    let currLinkButton = document.createElement("li");
    currLinkButton.setAttribute("class", `nav-id-${curr.id}`);
    let currButton = document.createElement("button");
    currButton.setAttribute("class", `nav-id-${curr.id}`);
    currButton.addEventListener("click", () => {
      setRoute(curr.assignedRoute);
      updateActiveNav(curr.assignedRoute);
    });
    currButton.appendChild(document.createTextNode(curr.title));
    currLinkButton.appendChild(currButton);
    programmaticNav.appendChild(currLinkButton);
  });
}

function updateActiveNav(
  fqRoute = window.location.hash,
  navConfigs = NAV_CONFIGS
) {
  let activeNavId = null;
  let result = TOP_ROUTE_EXTRACTOR.exec(fqRoute);
  if (result && result.length == 2) {
    let currRoute = result[1];

    let activeNavItem = navConfigs.find(toMatch => {
      return toMatch.assignedRoute === currRoute;
    });
    activeNavId = activeNavItem ? activeNavItem.id : null;
  }

  let navMenus = document.querySelectorAll("header nav ul");
  navMenus.forEach(menu => {
    let navEntries = menu.querySelectorAll("li").forEach(el => {
      let currClassList = el.classList;
      if (currClassList.contains(`nav-id-${activeNavId}`)) {
        currClassList.add("active");
      } else {
        currClassList.remove("active");
      }
    });
  });
}