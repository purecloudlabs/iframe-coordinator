<template>
  <div id="routerLayout">
    <div class="explainer">
      Showing
      <span class="app-route">{{ frameRoute }}</span>
      as
      <span class="frame-url">{{ frameUrl }}</span>
    </div>
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
    <frame-router
      id="frameRouter"
      v-bind:route="frameRoute"
      frame-id="ifc-cli-frame"
      v-on:notifyRequest="displayToast"
      v-on:registeredKeyFired="handleKeyEvent"
      v-on:navRequest="handleNav"
      v-on:frameTransition="updateFrameUrl"
    ></frame-router>
  </div>
</template>

<script>
export default {
  name: 'iframeEmbed',
  props: ['frameRoute'],
  data() {
    return {
      frameUrl: '',
      showMenu: true,
      clientConfig: {}
    };
  },
  methods: {
    displayToast(event) {
      const customJson = JSON.stringify(event.detail.custom, null, 2);
      const messageHtml = `<div class="message">${event.detail.message}</div>
                   <pre class="customData">${customJson}</pre>`;
      this.$notify({
        group: 'toast',
        title: event.detail.title,
        text: messageHtml,
        duration: event.detail.custom.duration || -1,
        type: 'toast'
      });
    },
    handleNav(event) {
      // TODO: detect and handle external URLs properly
      const requestedUrl = new URL(event.detail.url);

      if (location.hash === requestedUrl.hash) {
        // The requested navigation is for the current location, do nothing
      } else if (event.detail.history === 'replace') {
        window.location.replace(requestedUrl.hash);
      } else {
        window.location.hash = requestedUrl.hash;
      }
    },
    handleKeyEvent(event) {
      this.$notify({
        group: 'keydown',
        title: `registeredKeyFired event from ${event.detail.clientId}`,
        text: `<pre>${JSON.stringify(event.detail, null, 2)}</pre>`,
        duration: 3000,
        type: 'registeredKeyFired'
      });
    },
    notifyPubSub(event) {
      const jsonStr = JSON.stringify(event, null, 2);
      this.$notify({
        group: 'pubsub',
        title: `${event.clientId} on ${event.topic}`,
        text: `<pre>${jsonStr}</pre>`,
        duration: -1,
        type: 'pubsub'
      });
    },
    updateFrameUrl(event) {
      this.frameUrl = event.detail;
      this.showMenu = this.frameUrl === 'about:blank';
    }
  },
  mounted() {
    // Call the custom config set up on the CLI.
    const oldSetupFrames = frameRouter.setupFrames;
    frameRouter.setupFrames = (...args) => {
      oldSetupFrames.apply(frameRouter, args);
    };

    if (window.routerSetup && typeof window.routerSetup === 'function') {
      const clientConfig = window.routerSetup(frameRouter);
      this.clientConfig = frameRouter.clientConfig.clients;
      if (clientConfig.publishTopics) {
        clientConfig.publishTopics.forEach(topic => {
          frameRouter.messaging.addListener(topic, publication => {
            this.notifyPubSub(publication);
          });
        });
      }
    } else {
      // tslint:disable-next-line
      console.log(`====== ERROR ======
Could not find a function to set up the frame-router element with. Your
JS configuration file must assign a set-up function to \`module.exports\`.
Run:
  ifc-cli --help
for more details.
          `);
    }
  }
};
</script>

<style>
#routerLayout {
  display: flex;
  flex-direction: column;
  height: 100%;
}
#frameRouter {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 100vh;
}
#routerLayout .explainer {
  padding: 20px;
  background-color: #33383d;
  color: #fdfdfd;
  border-bottom: 2px solid #ff4f1f;
}
#routerLayout .app-route,
#routerLayout .frame-url {
  color: #ff4f1f;
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
