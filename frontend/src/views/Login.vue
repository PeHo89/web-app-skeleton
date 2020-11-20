<template>
  <div>
    <h1 class="center">Login</h1>
    <div id="login-form-container" class="p-shadow-12">
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="email-input" class="full-width" v-model="loginData.username" />
          <label for="email-input">Email</label>
        </span>
      </div>
      <div class="input-container">
        <span class="p-float-label">
          <InputText
            id="password-input"
            class="full-width"
            v-model="loginData.password"
            type="password"
          />
          <label for="password-input">Password</label>
        </span>
      </div>
      <div class="input-container">
        <div class="half-width-centered">
          <Button @click="login" label="Login" class="full-width"/>
        </div>
      </div>
      <div class="input-container">
        <div class="center">
          <Button class="p-button-text p-button-secondary" label="Forgot Password?" @click="$router.push('/resetpassword')"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { LoginDto } from "@/dto/login.dto";

export default defineComponent({
  name: "Login",
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
      const result = await this.$store.dispatch(
        "authentication/login",
        this.loginData
      );
      if (result) {
        this.$router.push("/");
      } else {
        this.$toast.add({severity:'error', summary: 'Login Failed', detail:'Invalid email or password', life: 5000});
      }
    },
  },
});
</script>

<style scoped>
#login-form-container {
  position: relative;
  width: 40%;
  height: 300px;
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
