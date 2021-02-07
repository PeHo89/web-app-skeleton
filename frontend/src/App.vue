<template>
  <TheMenubar></TheMenubar>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <Toast position="bottom-right" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheMenubar from "@/components/TheMenubar.vue";

export default defineComponent({
  name: "App",
  components: {
    TheMenubar
  }
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
.quarter-width-centered {
  position: relative;
  width: 25%;
  left: 37.5%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
