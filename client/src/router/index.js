import Vue from 'vue';
import VueRouter from 'vue-router';
import QueueView from '../views/Queue.vue';
import LoginView from '../views/Login.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/queue' },
  { path: '/queue', component: QueueView },
  { path: '/login', component: LoginView },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

// Setup Authentication guard
router.beforeEach((to, from, next) => {
  if (!store.state.isAuthenticated && to.path !== '/login') {
    console.info('Unauthenticated user. Redirecting to login page.');
    next('/login');
  } else {
    next();
  }
});

export default router;
