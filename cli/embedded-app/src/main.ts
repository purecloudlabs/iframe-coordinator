import Vue from 'vue';
import Notifications from 'vue-notification';
import App from './App.vue';
import router from './router';
import store from './store';

import { registerCustomElements } from 'iframe-coordinator';

registerCustomElements();

Vue.config.productionTip = false;

Vue.use(Notifications);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
