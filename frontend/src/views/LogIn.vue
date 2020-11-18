<template>
  <h1>LogIn</h1>
  <div class="p-grid">
    <div class="p-col-2 p-offset-5">
      <div class="p-md-4">
        <span class="p-float-label">
          <InputText id="email-input" v-model="loginData.username" />
          <label for="email-input">Email</label>
        </span>
      </div>
    </div>
  </div>
  <div class="p-grid">
    <div class="p-col-2 p-offset-5">
      <div class="p-md-4">
        <span class="p-float-label">
          <Password
              id="password-input"
              v-model="loginData.password"
              :feedback="false"
          />
          <label for="password-input">Password</label>
        </span>
      </div>
    </div>
  </div>
  <div class="p-grid">
    <div class="p-col-2 p-offset-5">
      <div class="p-md-6">
        <Button @click="login" style="width: 100%" label="Login" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {LoginDto} from "@/dto/login.dto";

export default defineComponent({
  name: "LogIn",
  data() {
    return {
      loginData: {
        username: "",
        password: "",
      } as LoginDto,
    };
  },
  methods: {
    async login() {
      const result = await this.$store.dispatch("authentication/login", this.loginData);
      if (result) {
        this.$router.push('/');
      } else {
        console.error('login failed');
      }
    },
  }
});
</script>

<style scoped></style>