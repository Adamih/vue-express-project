<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Queue starts here</h1>

        <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
          <fieldset v-if="!($store.state.isInQueue || $store.state.isAdmin)">
            <legend>Enter information</legend>
            <form v-on:submit.prevent="addToQueue()">
              <input
                class="form-control"
                type="text"
                placeholder="Information here"
                v-model="description"
                required autofocus/>
              <input class="btn btn-default" type="submit" value="Ok"/>
            </form>
          </fieldset>
        </div>
      </div>

      <div class="row">
        <h1>Queue list</h1>

        <table style="width: 100%;">
          <thead>
          <tr class="row">
            <th>Name</th>
            <th>Description</th>
            <th>Time in queue</th>
            <th>Remove?</th>
          </tr>
          </thead>
          <tbody>
          <tr
            class="row"
            v-for="e in queue"
            v-bind:key="e.userId"
          >
            <td>{{ e.userId }}</td>
            <td>{{ e.description }}</td>
            <td>{{ displayTimeInQueue(e.createdAt) }} minutes</td>
            <td>
              <button v-on:click="deleteFromQueue(e.userId)"
                      v-if="$store.state.userId === e.userId || $store.state.isAdmin">x</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue';
import axios from 'axios';

export default {
  name: 'Queue',
  components: {},
  data: () => ({
    socket: null,
    description: '',
    queue: [],
  }),
  methods: {
    addToQueue() {
      if (this.$store.state.isInQueue) {
        return;
      }
      axios.post('api/queue/', {
        description: this.description,
      }).then((res) => {
        if (res.status === 200) {
          this.$store.commit('setIsInQueue', true);
        }
      }).catch(console.error);
    },
    displayTimeInQueue(dt) {
      const dtDate = new Date(dt);
      return Math.ceil((new Date() - dtDate) / (1000 * 60));
    },
    deleteFromQueue(userId) {
      axios.delete(`/api/queue/${userId}`).then((res) => {
        if (res.status === 200 && this.$store.state.userId === userId) {
          this.$store.commit('setIsInQueue', false);
        }
      }).catch(console.error);
    },
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on('statusUpdate', (data) => {
      for (let i = 0; i < this.queue.length; i += 1) {
        if (this.queue[i].userId === data.userId) Vue.set(this.queue, i, data);
      }
    });
    this.socket.on('addToQueue', (data) => {
      this.queue.push(data);
      if (data.userId === this.$store.state.userId) {
        this.$store.commit('setIsInQueue', true);
      }
    });

    this.socket.on('deleteFromQueue', (data) => {
      this.queue = this.queue.filter(e => e.userId !== data.userId);
      if (data.userId === this.$store.state.userId) {
        this.$store.commit('setIsInQueue', false);
      }
    });

    axios.get('/api/queue').then((res) => {
      this.queue = res.data;
      this.queue.forEach((e) => {
        if (e.userId === this.$store.state.userId) {
          this.$store.commit('setIsInQueue', true);
        }
      });
    }).catch(console.error);
  },
};
</script>
