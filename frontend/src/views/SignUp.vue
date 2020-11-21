<template>
  <div>
    <h1 class="center">Sign Up</h1>
    <div id="signup-form-container" class="p-shadow-12">
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="email-input" class="full-width" v-model="signUpData.email" />
          <label for="email-input">Email</label>
        </span>
      </div>
      <div class="input-container">
        <span class="p-float-label">
          <InputText
              id="password-input"
              class="full-width"
              v-model="signUpData.password"
              type="password"
          />
          <label for="password-input">Password</label>
        </span>
      </div>
      <div class="input-container">
        <Checkbox id="accepted-terms-and-conditions-checkbox" v-model="acceptedTermsAndConditions" :binary="true"/><label for="accepted-terms-and-conditions-checkbox"> I accept <router-link :to="'/termsconditions'">terms & conditions</router-link>.</label>
      </div>
      <div class="input-container">
        <div class="half-width-centered">
          <Button @click="signUp" label="Sign Up" class="p-button-success full-width"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {UserService} from "@/services/user";
import {NewUserDto} from "@/dto/newUser.dto";
import {LoginDto} from "@/dto/login.dto";

export default defineComponent({
  name: "SignUp",
  data() {
    return {
      acceptedTermsAndConditions: false,
      signUpData: {
        email: "",
        password: "",
      } as NewUserDto,
    };
  },
  methods: {
    async signUp() {
      const userService = UserService.getSingletonInstance();

      let result;

      try {
        result = await userService.signUp(this.signUpData);
      } catch (error) {
        console.error(error);
      }

      if (result) {
        const result = await this.$store.dispatch(
            "authentication/login",
            {username: this.signUpData.email, password: this.signUpData.password} as LoginDto
        );
        if (result) {
          this.$toast.add({severity:'success', summary: 'Signed up', detail:'Welcome on board', life: 5000});
          this.$router.push("/");
        } else {
          this.$toast.add({severity:'error', summary: 'Sign up failed', detail:'Sign up failed due to server error', life: 5000});
        }
      }
    },
  },
});
</script>

<style scoped>
#signup-form-container {
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
