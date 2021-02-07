<template>
  <div>
    <h1 class="center">Subscription</h1>
    <p class="center">At this time, we have the following subscriptions for you</p>
    <div class="p-grid p-jc-center">
      <Card class="p-col-4" v-for="subscriptionDto in subscriptionDtos" :key="subscriptionDto.id">
        <template #title>
          {{ subscriptionDto.name }}
        </template>
        <template #content>
          <p>{{ subscriptionDto.description }}</p>
        </template>
        <template #footer>
          <div class="subscription-price">
            <b>{{ (subscriptionDto.amount / 100).toFixed(2) }}
            {{ subscriptionDto.currency.toUpperCase() }} /
              {{ subscriptionDto.interval.charAt(0).toUpperCase() + subscriptionDto.interval.slice(1) }}</b>
          </div>
          <div style="float: right">
            <Button
                label="Subscribe"
                class="p-button-success p-button-outlined p-button-sm"
                @click="subscribeToAbo(subscriptionDto.id)"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { UserService } from "@/services/user";
import { SubscriptionDto } from "@/dto/subscription.dto";
import { NewSubscriptionDto } from "@/dto/newSubscription.dto";

export default defineComponent({
  name: "Subscription",
  data() {
    return {
      subscriptionDtos: [] as SubscriptionDto[],
      /* global Stripe */
      stripe: Stripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY),
    };
  },
  async created() {
    const userService = UserService.getSingletonInstance();

    this.subscriptionDtos = await userService.getAvailableSubscriptions();
  },
  methods: {
    async subscribeToAbo(id: string) {
      const userService = UserService.getSingletonInstance();

      const newAboSubscriptionSessionDto = await userService.newSubscription(
        this.$store.getters["authentication/getAccessToken"],
        { id } as NewSubscriptionDto
      );

      this.stripe.redirectToCheckout(newAboSubscriptionSessionDto);
    },
  },
});
</script>

<style scoped>
.subscription-price {
  float: left;
  height: 32px;
  line-height: 32px;
  vertical-align: bottom;
}
.p-card {
 margin: 10px;
}
</style>
