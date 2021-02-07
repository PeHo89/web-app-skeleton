<template>
  <div>
    <h1 class="center">Subscription</h1>
    <h3 class="center">Thanks! Have fun with the premium features!</h3>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {UserService} from "@/services/user";

export default defineComponent({
  name: "SubscriptionSuccess",
  async mounted() {
    const userService = UserService.getSingletonInstance();

    try {
      const result = await userService.confirmSubscription(
        this.$store.getters["authentication/getAccessToken"],
        this.$route.query.session_id,
      );

      this.$toast.add({
        severity: "success",
        summary: "Subscription confirmed",
        detail: result,
        life: 5000
      });
    } catch (error) {
      this.$toast.add({
        severity: "error",
        summary: "Error on confirming subscription",
        detail: error.response.data.error,
        life: 5000
      });
    }
  }
});
</script>

<style scoped></style>
