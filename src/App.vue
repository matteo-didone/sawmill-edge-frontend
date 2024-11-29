<template>
  <div id="app">
    <DashboardView />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import DashboardView from '@/views/DashboardView.vue';

export default defineComponent({
  name: 'App',
  components: {
    DashboardView,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  min-height: 100vh;
}
</style>
