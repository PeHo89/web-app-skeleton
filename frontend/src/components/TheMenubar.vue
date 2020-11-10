<template>
  <Menubar :model="mainMenu">
    <template #start><h3>{{appName}}</h3></template>
    <template v-if="!isLoggedIn" #end>
      <InputText v-model="loginData.username" placeholder="Email" />
      <Password
        v-model="loginData.password"
        :feedback="false"
        placeholder="Password"
      />
      <Button @click="login" label="Login" />
    </template>
    <template v-else #end>
      <Button @click="logout" label="Logout" />
    </template>
  </Menubar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { LoginDto } from "../dto/login.dto";

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
  },
  methods: {
    login() {
      this.$store.dispatch("authentication/login", this.loginData);
    },
    logout() {
      this.$store.dispatch('authentication/logout');
    }
  },
  computed: {
    isLoggedIn(): boolean {
      return this.$store.getters['authentication/isLoggedIn'];
    }
  }
});
</script>

<style scoped></style>
