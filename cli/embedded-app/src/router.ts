import Vue from 'vue';
import Router from 'vue-router';
import IframeEmbed from './views/IframeEmbed.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/*',
      component: IframeEmbed,
      props: true
    }
  ]
});
