<template>
  <div>
    <h1 class="center">Confirm Email</h1>
    <div id="confirm-email-form-container" class="p-shadow-12">
      <div class="input-container">
        <p>Would you like to confirm your email '{{$route.query.email}}'?</p>
      </div>
      <div class="input-container">
        <div>
          <Button class="p-button-success" type="success" @click="confirm" label="Confirm"/>
          &nbsp;
          <Button class="p-button-danger" @click="dismiss" label="Dismiss"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {UserService} from "@/services/user";


export default defineComponent({
  name: "ConfirmEmail",
  methods: {
    async confirm() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.confirmEmail(this.$route.query.userId, this.$route.query.token);

        this.$toast.add({severity: 'success', summary: 'Email confirmed', detail: result, life: 5000});

        this.$router.push('/');

      } catch (error) {
        this.$toast.add({severity:'error', summary: 'Error on confirming email', detail: error.response.data.error, life: 5000});
      }

    },
    dismiss() {
      this.$toast.add({severity:'success', summary: 'Email not confirmed', detail: 'Please confirm your email soon', life: 5000});
      this.$router.push('/');
    }
  }
});
</script>

<style scoped>
#confirm-email-form-container {
  position: relative;
  width: 40%;
  height: 150px;
  left: 30%;
  padding: 20px;
}
.input-container {
  position: relative;
  width: 80%;
  left: 10%;
  text-align: center;
}
</style>