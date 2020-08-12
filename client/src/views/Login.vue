<template>
  <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
    <h1>Login</h1>
    <form v-on:submit.prevent="done()">
      <label for="name">username</label>
      <input id="name" class="form-control" type="text" v-model="name" required autofocus />
      <label for="pass">password</label>
      <input id="pass" class="form-control" type="password" v-model="pass" required />
      <input class="btn btn-default" type="submit" value="Ok" />
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  components: {},
  data: () => ({
    name: '',
    pass: '',
  }),
  methods: {
    done() {
      axios.post('/api/authenticate', {
        username: this.name,
        password: this.pass,
      }).then((resp) => {
        if (resp.status === 200) return resp;
        this.$store.commit('setIsAuthenticated', false);
        throw new Error(resp.text);
      }).then((resp) => {
        this.$store.commit('setIsAuthenticated', true);
        this.$store.commit('setUserId', this.name);
        this.$store.commit('setIsAdmin', resp.data.isAdmin);
        this.$router.push({
          path: 'queue',
        });
      }).catch((error) => {
        console.error('Authentication failed unexpectedly');
        throw error;
      });
    },
  },
};
</script>
