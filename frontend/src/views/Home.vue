<template>
  <div class="home">
    <TheMenubar></TheMenubar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheMenubar from "@/components/TheMenubar.vue";

export default defineComponent({
  name: "Home",
  components: {
    TheMenubar,
  },
});
</script>
