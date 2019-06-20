<template>
  <div id="routerLayout">
    <div class="explainer">
      Showing
      <span class="app-route">{{ frameRoute }}</span>
      as
      <span class="frame-url">{{ frameUrl }}</span>
    </div>
    <frame-router
      id="frameRouter"
      v-bind:route="frameRoute"
      v-on:toastRequest="displayToast"
      v-on:navRequest="handleNav"
      v-on:frameTransition="updateFrameUrl"
    ></frame-router>
  </div>
</template>

<script>
export default {
  name: 'iframeEmbed',
  props: ['pathMatch'],
  data() {
    return {
      frameUrl: ''
    };
  },
  computed: {
    frameRoute() {
      // Ensure route is valid when the matched path is '';
      return '/' + this.pathMatch;
    }
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
      window.location.hash = requestedUrl.hash;
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
    }
  },
  mounted() {
    // Call the custom config set up on the CLI.
    if (window.routerSetup && typeof window.routerSetup === 'function') {
      const clientConfig = window.routerSetup(frameRouter);
      clientConfig.publishTopics.forEach(topic => {
        frameRouter.messaging.addListener(topic, publication => {
          this.notifyPubSub(publication);
        });
      });
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
</style>
