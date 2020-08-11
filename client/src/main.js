import Vue from 'vue';
import io from 'socket.io-client';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

(async () => {
  // Find out if the user is already logged in
  await axios.get('/api/isAuthenticated').then((res) => {
    store.commit('setIsAuthenticated', res.data.isAuthenticated);
    store.commit('setUserId', res.data.username);
    store.commit('setIsAdmin', res.data.isAdmin);
  }).catch(console.error);

  new Vue({
    router,
    store,
    render: h => h(App),
    data: {
      socket: io().connect(),
    },
  }).$mount('#app');
})();
