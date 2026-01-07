<template>
  <div id="worker-control-panel">
    <div id="worker-selection">
      <label for="worker-select">Targeted Worker:</label>
      <select v-model="activeWorker" id="worker-select">
        <option
          v-for="(client, name) in workerPool.workerConfig.clients"
        >
          {{name}}
        </option>
      </select>
    </div>
    <div id="worker-communication">
      <div>
        <label for="message-topic">Topic:</label>
        <input v-model="topic" type="text" id="message-topic"></input>
      </div>
      <div>
        <label for="worker-message">Message</label>
        <textarea v-model="message" id="worker-message"></textarea>
      <div>
      <button v-on:click="sendMessage()">Send to {{activeWorker}}</button>
    <div>
  </div>
</template>

<script>
let defaultMessage = {
  api: "requestNotification",
  data: {
    title: "Worker Notification",
    message: "A worker sent this"
  }
};

export default {
  name: "WorkerControls",
  props: ["workerPool"],
  data() {
    return {
      topic: 'exerciseApi',
      message: JSON.stringify(defaultMessage, null, 2),
      activeWorker: Object.keys(this.workerPool.workerConfig.clients)[0]
    };
  },
  methods: {
    sendMessage: function() {
      this.workerPool.publish(this.activeWorker, {
        topic: this.topic,
        payload: JSON.parse(this.message)
      });
    }
  }
}
</script>

<style>
  #worker-control-panel {
    width: 500px;
    padding: 20px;
    background-color: #33383d;
    color: #fdfdfd;
    text-align: left;
  }

  #worker-selection {
    text-align: center;
    margin-bottom: 20px;  
  }

  label[for="worker-select"] {
    margin-right: 10px;
  }

  label[for="worker-message"] {
    display: block;
  }

  #worker-message {
    width: 100%;
    height: 200px;
    margin-bottom: 5px;
  }
</style>
