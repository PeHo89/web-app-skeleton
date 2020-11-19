<template>
  <TheMenubar></TheMenubar>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheMenubar from "@/components/TheMenubar.vue";

export default defineComponent({
  name: "App",
  components: {
    TheMenubar,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.center {
  text-align: center;
}
.full-width {
  width: 100%;
}
.half-width-centered {
  position: relative;
  width: 50%;
  left: 25%;
}
</style>
