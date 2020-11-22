<template>
  <div id="update-password-form-container" class="p-shadow-12">
    <h4 class="center">Update Password</h4>
    <div class="input-container">
        <span class="p-float-label">
          <InputText
              id="current-password-input"
              class="full-width"
              v-model="updatePasswordDto.oldPassword"
              type="password"
          />
          <label for="current-password-input">Current Password</label>
        </span>
    </div>
    <div class="input-container">
        <span class="p-float-label">
          <InputText
              id="new-password-input"
              class="full-width"
              v-model="updatePasswordDto.newPassword"
              type="password"
          />
          <label for="new-password-input">New Password</label>
        </span>
    </div>
    <div class="input-container">
      <div>
        <Button
            @click="updatePassword"
            label="Update Password"
            class="center"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {UpdatePasswordDto} from "../dto/updatePassword.dto";
import {UserService} from "../services/user";

export default defineComponent({
  name: "TheUpdatePasswordCard",
  data() {
    return {
      updatePasswordDto: {
        oldPassword: "",
        newPassword: "",
      } as UpdatePasswordDto,
    }
  },
  methods: {
    async updatePassword() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.updatePassword(
            this.$store.getters["authentication/getAccessToken"],
            this.updatePasswordDto
        );

        this.$toast.add({
          severity: "success",
          summary: "Password updated",
          detail: result,
          life: 5000,
        });
        await this.$store.dispatch("user/loadUser");
        this.resetForm();
      } catch (error) {
        this.$toast.add({
          severity: "error",
          summary: "Error on updating password",
          detail: error.response.data.error,
          life: 5000,
        });
      }
    },
    resetForm() {
      this.updatePasswordDto.oldPassword = "";
      this.updatePasswordDto.newPassword = "";
    }
  },
});
</script>

<style scoped>
#update-password-form-container {
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
</style>