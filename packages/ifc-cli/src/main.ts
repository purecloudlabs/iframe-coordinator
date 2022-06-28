// Required polyfills for iframe-coordinator IE11 support
import 'core-js';
import 'custom-event-polyfill/polyfill';
import '@webcomponents/custom-elements/src/native-shim';
import '@webcomponents/custom-elements';
// IE11 compatible iframe-coordinator import
import { registerCustomElements } from 'iframe-coordinator/dist';

import Vue from 'vue';
import Notifications from 'vue-notification';
import App from './App.vue';
import router from './router';
import store from './store';

registerCustomElements();

window.addEventListener('error', evt => {
  console.error('Uncaught Error:', evt.error);
});

Vue.config.productionTip = false;

Vue.use(Notifications);

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    // IE11 routing workaround
    if (
      '-ms-scroll-limit' in document.documentElement.style &&
      '-ms-ime-align' in document.documentElement.style
    ) {
      window.addEventListener(
        'hashchange',
        event => {
          const currentPath = window.location.hash.slice(1);
          if (this.$route.path !== currentPath) {
            this.$router.push(currentPath);
          }
        },
        false
      );
    }
  }
}).$mount('#app');
