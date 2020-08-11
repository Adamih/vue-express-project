<template>
  <div class="container">
    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Create new timeslot</h1>
      </div>

      <div>
        <div class="text-box col-md-4 col-md-offset-4" style="text-align: center">
          <fieldset>
            <legend>Enter time</legend>
              <form v-on:submit.prevent="createTimeslot()">
                <label for="time">Time</label>
                <input
                  id="time"
                  class="form-control"
                  type="text"
                  placeholder="12:00"
                  v-model="time"
                  required autofocus />
                <input class="btn btn-default" type="submit" value="Ok" />
              </form>
          </fieldset>
        </div>
      </div>
    </section>

    <section class="col-md-10 col-md-offset-1">
      <div class="row" style="text-align: center;">
        <h1>Delete timeslot</h1>
      </div>

      <div class="row">
        <div
          class="well"
          v-for="timeslot in timeslots"
          @click="deleteTimeslot(timeslot.timeslotId)"
          :key="timeslot.timeslotId"
        >
          <div class="row" style="text-align: center;">
            <h4>
              <span>
        {{ timeslot.time }}
        -
        {{ timeslot.status !== "Open" ? `${timeslot.status} by ${timeslot.bookedBy}`  : "" }}
              </span>
            </h4>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Admin',
  components: {},
  data: () => ({
    timeslots: [],
    time: null,
  }),
  methods: {
    createTimeslot() {
      axios.post('api/timeslots/', {
        time: this.time,
      }).then((res) => {
        this.timeslots.push(res.data);
      }).catch(console.error);
    },
    deleteTimeslot(timeslotId) {
      axios.delete(`api/timeslots/${timeslotId}`).then((res) => {
        console.log(res);
        this.timeslots = this.timeslots.filter(e => e.timeslotId !== timeslotId);
      }).catch(console.error);
    },
  },
  created() {
    const self = this;

    fetch('api/timeslots/me')
      .then(res => res.json())
      .then((data) => { self.timeslots = data; });
  },
};
</script>
