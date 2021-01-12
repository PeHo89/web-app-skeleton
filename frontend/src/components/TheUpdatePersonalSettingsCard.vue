<template>
  <div id="update-personal-settings-form-container" class="p-shadow-12">
    <h4 class="center">Update Personal Settings</h4>
    <div class="input-container">
      <label class="switch-label" for="newsletter-switch">Newsletter</label>
      <InputSwitch
        id="newsletter-switch"
        v-model="personalSettingsForm.newsletter"
        @change="onNewsletterSwitchChange"
      />
    </div>
    <div class="input-container">
      <div>
        <Button
          @click="updatePersonalSettings"
          label="Update Personal Settings"
          class="center"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { UserService } from "@/services/user";
import { PersonalSettings, UserDto } from "@/dto/user.dto";
import { Helper } from "@/common/Helper";

export default defineComponent({
  name: "TheUpdatePersonalSettingsCard",
  data() {
    return {
      personalSettingsForm: {
        newsletter: false,
      },
      personalSettings: {
        newsletterSubscription: null,
      } as PersonalSettings,
    };
  },
  created() {
    this.loadSettings();
  },
  methods: {
    async updatePersonalSettings() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.updatePersonalSettings(
          this.$store.getters["authentication/getAccessToken"],
          this.personalSettings
        );

        this.$toast.add({
          severity: "success",
          summary: "Personal settings updated",
          detail: result,
          life: 5000,
        });
        await this.$store.dispatch("user/loadUser");
      } catch (error) {
        this.$toast.add({
          severity: "error",
          summary: "Error on updating personal settings",
          detail: error.response.data.error,
          life: 5000,
        });
      }
    },
    loadSettings() {
      if (!this.user.personalSettings) {
        this.personalSettingsForm.newsletter = false;
      } else {
        this.personalSettings.newsletterSubscription = this.user.personalSettings.newsletterSubscription;
        this.personalSettingsForm.newsletter =
          this.user.personalSettings.newsletterSubscription !== null;
      }
    },
    onNewsletterSwitchChange() {
      if (this.personalSettingsForm.newsletter) {
        this.personalSettings.newsletterSubscription = new Date();
      } else {
        this.personalSettings.newsletterSubscription = null;
      }
    },
  },
  computed: {
    user(): UserDto {
      return this.$store.getters["user/getUser"];
    },
  },
});
</script>

<style scoped>
#update-personal-settings-form-container {
  position: relative;
  width: 40%;
  height: 320px;
  left: 30%;
  padding: 20px;
  top: 50px;
}
.input-container {
  position: relative;
  width: 50%;
  left: 25%;
  text-align: center;
  padding-top: 30px;
}
.switch-label {
  position: relative;
  top: -8px;
  margin-right: 20px;
}
</style>
