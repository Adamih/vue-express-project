<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Confirm</h1>
      </div>

      <div>
        <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
          <fieldset>
            <legend>Enter booking information</legend>
              <form v-on:submit.prevent="done()">
                <input
                  class="form-control"
                  type="text"
                  placeholder="Jon doe"
                  v-model="name"
                  required autofocus />
                <input class="btn btn-default" type="submit" value="Ok" />
              </form>
              <form v-on:submit.prevent="cancel()">
                <input class="btn btn-default" type="submit" value="Cancel" />
              </form>
          </fieldset>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Confirm',
  components: {},
  props: ['timeslotId'],
  data: () => ({
    name: '',
  }),
  methods: {
    async done() {
      axios.put(`api/timeslots/${this.timeslotId}/book`, { bookedBy: this.name }).then(() => {
        this.redirect('/booking');
      }).catch(console.error);
    },
    redirect(target) {
      if (this.$route.path !== target) {
        this.$router.push(target);
      }
    },
    cancel() {
      axios.put(`api/timeslots/${this.timeslotId}/cancel`).then(() => {
        this.redirect('/booking');
      }).catch(console.error);
    },
  },
  created() {
    setTimeout(() => {
      this.redirect('/booking');
    }, 20000);
    axios.put(`api/timeslots/${this.timeslotId}/reserve`, { status: 'Reserved' })
      .catch(console.error);
  },
};
</script>
