<template>
  <Menubar :model="mainMenu">
    <template #start
      ><h1>{{ appName }}</h1></template
    >
    <template v-if="!isLoggedIn" #end>
      <div class="p-fluid flex">
        <div class="p-md-4">
          <span class="p-float-label">
            <InputText id="email-input" v-model="loginData.username" />
            <label for="email-input">Email</label>
          </span>
        </div>
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
        <div class="p-md-2">
          <Button @click="login" label="Login" />
        </div>
      </div>
    </template>
    <template v-else #end>
      <img style="max-width: 66px;" :src="profileImage" />
      <span style="margin-right: 5px">{{ user.email }}</span>
      <Button @click="logout" label="Logout" />
    </template>
  </Menubar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { LoginDto } from "../dto/login.dto";
import { UserDto } from "@/dto/user.dto";

export default defineComponent({
  name: "TheMenubar",
  data() {
    return {
      appName: "",
      mainMenu: [],
      loginData: {
        username: "",
        password: "",
      } as LoginDto,
    };
  },
  async created() {
    this.appName = process.env.VUE_APP_NAME;
    await this.$store.dispatch("authentication/loadFromLocalStorage");
    await this.$store.dispatch("user/loadUser");
  },
  methods: {
    async login() {
      this.$store.dispatch("authentication/login", this.loginData);
    },
    logout() {
      this.$store.dispatch("authentication/logout");
    },
  },
  computed: {
    isLoggedIn(): boolean {
      return this.$store.getters["authentication/isLoggedIn"];
    },
    user(): UserDto {
      return this.$store.getters["user/getUser"];
    },
    profileImage(): string {
      if (this.$store.getters["user/getProfileImage"]) {
        return this.$store.getters["user/getProfileImage"];
      } else {
        return '/img/profile_image_placeholder.png';
      }
    },
  },
});
</script>

<style scoped></style>
