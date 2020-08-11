import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// no-param-reassign prevents store.isAuthenticated = isAuthenticated
/* eslint-disable no-param-reassign */
export default new Vuex.Store({
  state: {
    isAuthenticated: false,
    isInQueue: false,
    userId: null,
    isAdmin: false,
  },
  mutations: {
    setIsAuthenticated(store, isAuthenticated) {
      store.isAuthenticated = isAuthenticated;
    },
    setIsInQueue(store, isInQueue) {
      store.isInQueue = isInQueue;
    },
    setUserId(store, userId) {
      store.userId = userId;
    },
    setIsAdmin(store, isAdmin) {
      store.isAdmin = isAdmin;
    },
  },
  actions: {
  },
  modules: {
  },
});
