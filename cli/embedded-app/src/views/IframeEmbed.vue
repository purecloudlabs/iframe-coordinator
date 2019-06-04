<template>
  <div id="routerLayout">
    <div class="explainer">
      Showing
      <span class="app-route">{{ frameRoute }}</span>
    </div>
    <frame-router id="frameRouter" v-bind:route="frameRoute"></frame-router>
  </div>
</template>

<script>
export default {
  name: 'iframeEmbed',
  props: ['pathMatch'],
  computed: {
    frameRoute() {
      // Ensure route is valid when the matched path is '';
      return '/' + this.pathMatch;
    }
  },
  mounted() {
    if (window.routerSetup && typeof window.routerSetup === 'function') {
      window.routerSetup(frameRouter);
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
#routerLayout .frame-location {
  color: #2a60c8;
}
</style>
