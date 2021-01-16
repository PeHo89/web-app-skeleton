<template>
  <div>
    <h1 class="center">Login</h1>
    <div id="login-form-container" class="p-shadow-12">
      <div class="input-container">
        <span class="p-float-label">
          <InputText
            id="email-input"
            class="full-width"
            v-model="loginData.username"
          />
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
          <Button @click="login" label="Login" class="full-width" />
        </div>
      </div>
      <div class="input-container">
        <hr />
      </div>
      <p class="full-width center">
        No account? <router-link to="/signup">Signup</router-link> or login with
      </p>
      <div class="full-width center">
        <Button
          @click="loginWithGoogle"
          label="Google"
          class="center p-button-text p-button-plain p-button-raised"
          icon="pi pi-google"
          iconPos="right"
        />
      </div>
      <div class="input-container">
        <div class="center">
          <Button
            class="p-button-text p-button-secondary"
            label="Forgot Password?"
            @click="$router.push('/resetpassword')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { LoginDto } from "@/dto/login.dto";
import { IdTokenDto } from "@/dto/idToken.dto";

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
        this.$toast.add({
          severity: "error",
          summary: "Error on logging in",
          detail: "Wrong credentials",
          life: 5000,
        });
      }
    },
    async loginWithGoogle() {
      let googleUser;

      try {
        googleUser = await this.$gAuth.signIn();
      } catch (error) {
        if (error.error === "popup_closed_by_user") {
          console.log("Google login pop up closed by the user");
        } else {
          console.error(error);
        }
        return;
      }

      const idTokenDto = {
        idToken: googleUser.getAuthResponse().id_token,
      } as IdTokenDto;

      const result = await this.$store.dispatch(
        "authentication/loginWithGoogle",
        idTokenDto
      );
      if (result) {
        this.$router.push("/");
      } else {
        this.$toast.add({
          severity: "error",
          summary: "Error on logging in",
          detail: "Wrong credentials",
          life: 5000,
        });
      }
    },
  },
});
</script>

<style scoped>
#login-form-container {
  position: relative;
  width: 40%;
  height: 430px;
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
