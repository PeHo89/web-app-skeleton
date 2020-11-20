<template>
  <h1 class="center">Reset Password</h1>
  <div id="reset-password-form-container" class="p-shadow-12">
    <div class="input-container">
      <span class="p-float-label">
        <InputText id="email-input" class="full-width" v-model="emailDto.email" />
        <label for="email-input">Email</label>
      </span>
    </div>
    <div class="input-container">
      <div class="full-width-centered">
        <Button @click="resetPassword" label="Reset Password" class="full-width"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {EmailDto} from "@/dto/email.dto";
import {UserService} from "@/services/user";


export default defineComponent({
  name: "ResetPassword",
  data() {
    return {
      emailDto: {
        email: ''
      } as EmailDto
    }
  },
  methods: {
    async resetPassword() {
      const userService = UserService.getSingletonInstance();

      const result = await userService.resetPassword(this.emailDto);

      console.log(result);

      this.$router.push('/');
    }
  }
});
</script>

<style scoped>
#reset-password-form-container {
  position: relative;
  width: 40%;
  height: 200px;
  left: 30%;
  padding: 20px;
}
.input-container {
  position: relative;
  width: 50%;
  left: 25%;
  text-align: center;
  padding-top: 30px;
}
</style>