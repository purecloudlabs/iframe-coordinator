<template>
  <div id="routerLayout">
    <div class="explainer">
      <!-- IFC worker controls -->
      <div class="worker-controls"
        v-if="Object.keys(workerConfig).length > 0"
      >
        <button class="worker-controls"
          v-on:click="toggleWorkerControls"
        >
          Toggle Worker Controls
        </button>
      </div>
      
      <!-- frame-router status explainer -->
      <div class="router-status">
        Showing
        <span class="app-route">{{ frameRoute }}</span>
        as
        <span class="frame-url">{{ frameUrl }}</span>
        <span v-if="currentClientId">
          with Client Id of
          <span class="client-id">{{ currentClientId }}</span>
        </span>
        <span v-else> because no client matched</span>
        <span class="metadata-container">
          <span class="metadata-title">Page Metadata: </span>
          <span class="metadata-content">{{ metadata }}</span>
        </span>
      </div>

      <!-- documentation link -->
      <a class="help-link" target="docs" href="/ifc-docs/">docs</a>
    </div>

    <div id="main">
      <!-- Menu for invalid/unassigned routes -->
      <div v-if="showMenu" id="appMenu">
        <h2>No app is registered for {{ frameRoute }}</h2>

        <div v-if="Object.keys(clientConfig).length > 0">
          <p>To see your embedded apps, use one of the links below.</p>
          <nav>
            <ul>
              <li v-for="(client, id) in clientConfig" v-bind:key="id">
                <a v-bind:href="'#' + client.assignedRoute"
                  >{{ id }} @ {{ client.assignedRoute }}</a
                >
              </li>
            </ul>
          </nav>
        </div>
        <div v-else>
          <p>
            I couldn't find any registered client applications. Please check your
            ifc-cli configuration file.
          </p>
        </div>
      </div>
      <!-- Active IFC client display on assigned routes -->
      <frame-router
        v-show="!showMenu"
        id="frameRouter"
        v-bind:route="frameRoute"
        frame-id="ifc-cli-frame"
        v-on:notifyRequest="displayToast"
        v-on:registeredKeyFired="handleKeyEvent"
        v-on:navRequest="handleNav"
        v-on:promptOnLeave="handlePromptOnLeave"
        v-on:frameTransition="updateFrameUrl"
        v-on:pageMetadata="updatePageMetadata"
        v-on:clientChanged="updateCurrentClientId"
      ></frame-router>
      <!-- Toggleable web-worker controls -->
      <worker-controls
        v-bind:worker-pool="workerPool"
        v-if="showWorkerControls"
      ></worker-controls>
    </div>
  </div>
</template>

<script>
import { WorkerPool } from "iframe-coordinator";
import WorkerControls from "./WorkerControls.vue";

export default {
  name: "iframeEmbed",
  props: ["frameRoute"],
  components: {
    WorkerControls
  },
  data() {
    return {
      workerPool: {},
      frameUrl: "",
      showMenu: true,
      clientConfig: {},
      workerConfig: {},
      metadata: {},
      currentClientId: "",
      showWorkerControls: false
    };
  },
  methods: {
    toggleWorkerControls() {
      this.showWorkerControls = !this.showWorkerControls;
    },
    displayToast(event) {
      const customJson = JSON.stringify(event.detail.custom, null, 2);
      const messageHtml = `<div class="message">${event.detail.message}</div>
                   <pre class="customData">${customJson}</pre>`;
      this.$notify({
        group: "toast",
        title: event.detail.title,
        text: messageHtml,
        duration: event.detail.custom?.duration || -1,
        type: "toast",
      });
    },
    handleNav(event) {
      // TODO: detect and handle external URLs properly
      const requestedUrl = new URL(event.detail.url, window.location);

      if (location.hash === requestedUrl.hash) {
        // The requested navigation is for the current location, do nothing
      } else if (event.detail.history === "replace") {
        window.location.replace(requestedUrl.hash);
      } else {
        window.location.hash = requestedUrl.hash;
      }
    },
    handleKeyEvent(event) {
      this.$notify({
        group: "keydown",
        title: `registeredKeyFired event from ${event.detail.clientId}`,
        text: `<pre>${JSON.stringify(event.detail, null, 2)}</pre>`,
        duration: 3000,
        type: "registeredKeyFired",
      });
    },
    notifyPubSub(event) {
      const jsonStr = JSON.stringify(event, null, 2);
      this.$notify({
        group: "pubsub",
        title: `${event.clientId} on ${event.topic}`,
        text: `<pre>${jsonStr}</pre>`,
        duration: -1,
        type: "pubsub",
      });
    },
    updateFrameUrl(event) {
      this.frameUrl = event.detail;
      this.showMenu = this.frameUrl === "about:blank";
    },
    updatePageMetadata(event) {
      this.metadata = {
        title: event.detail.title,
        breadcrumbs: event.detail.breadcrumbs,
      };
    },
    handlePromptOnLeave(event) {
      if (event.detail.shouldPrompt === true) {
        window.onbeforeunload = function (event) {
          event.preventDefault();
          //This is needed for compatibility with Google Chrome.
          event.returnValue = "";
        };
      }
      if (event.detail.shouldPrompt === false) {
        window.onbeforeunload = null;
      }
    },
    updateCurrentClientId(event) {
      this.currentClientId = event.detail || "";
    },
  },
  mounted() {
    // Create the web worker pool
    this.workerPool = new WorkerPool();
    // Add worker pool event handlers
    this.workerPool.addEventListener('navRequest', this.handleNav);
    this.workerPool.addEventListener('notifyRequest', this.displayToast);
    this.workerPool.addEventListener('promptOnLeave', this.handlePrompotOnLeave);

    // Call the custom config set up on the CLI.
    const oldSetupFrames = frameRouter.setupFrames;
    frameRouter.setupFrames = (...args) => {
      oldSetupFrames.apply(frameRouter, args);
    };

    if (window.routerSetup && typeof window.routerSetup === "function") {
      const clientConfig = window.routerSetup(frameRouter, this.workerPool);
      this.clientConfig = frameRouter.clientConfig.clients;
      this.workerConfig = this.workerPool.clientConfig.clients;

      // Start web workers
      console.log("Starting IFC workers", this.workerPool.clientConfig);
      this.workerPool.start();

      if (clientConfig.publishTopics) {
        clientConfig.publishTopics.forEach((topic) => {
          frameRouter.messaging.addListener(topic, (publication) => {
            this.notifyPubSub(publication);
          });
        });
      }
    } else {
      console.log(`====== ERROR ======
Could not find a function to set up the frame-router element with. Your
JS configuration file must assign a set-up function to \`module.exports\`.
Run:
  ifc-cli --help
for more details.
          `);
    }
  },
};
</script>

<style>
#routerLayout {
  display: flex;
  flex-direction: column;
  height: 100%;
}
#main {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
}
#frameRouter {
  flex-grow: 1;
}
#routerLayout .explainer {
  padding: 20px;
  background-color: #33383d;
  color: #fdfdfd;
}
.help-link {
  position: absolute;
  top: 5px;
  right: 15px; 
  color: #1fc0ff;
}
button {
  background-color: #33383d;
  color: #1fc0ff;
  border: 1px solid #1fc0ff;
  border-radius: 4px;
  padding: 3px 8px;
  text-align: center;
}
#routerLayout .app-route,
#routerLayout .frame-url,
#routerLayout .client-id,
#routerLayout .metadata-container .metadata-content {
  color: #ff4f1f;
}

#routerLayout .metadata-container {
  display: flex;
  text-align: left;
  float: right;
  width: 800px;
}

#routerLayout .metadata-container .metadata-title {
  margin-right: 5px;
  width: 150px;
}

#appMenu {
  max-width: 80ch;
  margin: auto;
}
#appMenu nav {
  text-align: left;
}
#appMenu ul {
  margin: 0;
  padding: 0;
}
#appMenu li {
  list-style: none;
}
</style>
