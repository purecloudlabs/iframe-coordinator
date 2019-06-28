<template>
  <div id="app">
    <notifications group="toast" id="toastNotifications" position="top right"></notifications>
    <notifications group="pubsub" id="pubsubEvents" position="top left"></notifications>
    <notifications group="keydown" id="keydowmEvents" position="bottom left"></notifications>
    <router-view/>
  </div>
</template>

<style>
body {
  padding: 0;
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.vue-notification.toast {
  background-color: #2a60c8;
  color: #fdfdfd;
  border-color: #75a8ff;
}

.vue-notification.pubsub {
  background-color: #444a52;
  border-color: #ff4f1f;
}
</style>
