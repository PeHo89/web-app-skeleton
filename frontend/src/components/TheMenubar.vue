<template>
  <Menubar :model="mainMenu">
    <template #start>
      <h1>{{ appName }}</h1>
    </template>
    <template v-if="!isLoggedIn" #end>
      <Button
        label="Login"
        icon="pi pi-unlock"
        @click="$router.push('/login')"
      />
      &nbsp;
      <Button
        label="Sign Up"
        class="p-button-success"
        icon="pi pi-user-plus"
        @click="$router.push('/signup')"
      />
    </template>
    <template v-else #end>
      <img
        v-tooltip.left="user.email"
        v-if="profileImage"
        class="profile-image"
        :src="profileImage"
      />
      <img
        v-tooltip.left="user.email"
        v-else
        class="profile-image"
        src="/img/profile_image_placeholder.png"
      />
    </template>
  </Menubar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { UserDto } from "@/dto/user.dto";

export default defineComponent({
  name: "TheMenubar",
  data() {
    return {
      appName: "",
      mainMenu: [
        {
          label: "Home",
          icon: "pi pi-fw pi-home",
          to: "/home"
        },
        {
          label: "About",
          icon: "pi pi-fw pi-info-circle",
          to: "/about"
        },
        {
          label: "Admin",
          icon: "pi pi-fw pi-cog",
          to: "/admin",
          // @ts-ignore
          visible: () => this.isLoggedIn && this.isAdmin
        },
        {
          label: "User",
          icon: "pi pi-fw pi-user",
          // @ts-ignore
          visible: () => this.isLoggedIn,
          items: [
            {
              label: "Profile",
              icon: "pi pi-fw pi-user-edit",
              to: "/profile"
            },
            {
              separator: true
            },
            {
              label: "Logout",
              icon: "pi pi-fw pi-power-off",
              // @ts-ignore
              command: () => this.logout()
            }
          ]
        }
      ]
    };
  },
  async created() {
    this.appName = process.env.VUE_APP_NAME;
    await this.$store.dispatch("authentication/loadFromLocalStorage");
    await this.$store.dispatch("user/loadUser");
  },
  methods: {
    logout() {
      this.$store.dispatch("authentication/logout");
      this.$router.push("/");
    }
  },
  computed: {
    isLoggedIn(): boolean {
      return this.$store.getters["authentication/isLoggedIn"];
    },
    isAdmin(): boolean {
      return this.$store.getters["user/isAdmin"];
    },
    user(): UserDto {
      return this.$store.getters["user/getUser"];
    },
    profileImage(): string | null {
      if (this.$store.getters["user/getProfileImage"]) {
        return this.$store.getters["user/getProfileImage"];
      } else {
        return null;
      }
    }
  }
});
</script>

<style scoped>
.profile-image {
  max-width: 65px;
  border-radius: 50px;
}
</style>
