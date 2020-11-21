<template>
  <div>
    <h1 class="center">Profile</h1>
    <div id="update-email-form-container" class="p-shadow-12">
    <h4 class="center">Update Email</h4>
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="current-email-input" class="full-width" v-model="updateEmailDto.oldEmail" />
          <label for="current-email-input">Current Email</label>
        </span>
      </div>
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="new-email-input" class="full-width" v-model="updateEmailDto.newEmail" />
          <label for="new-email-input">New Email</label>
        </span>
      </div>
      <div class="input-container">
        <div class="half-width-centered">
          <Button @click="updateEmail" label="Update" class="full-width"/>
        </div>
      </div>
    </div>
    <div id="update-password-form-container" class="p-shadow-12">
      <h4 class="center">Update Password</h4>
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="current-password-input" class="full-width" v-model="updatePasswordDto.oldPassword" type="password" />
          <label for="current-password-input">Current Password</label>
        </span>
      </div>
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="new-password-input" class="full-width" v-model="updatePasswordDto.newPassword" type="password" />
          <label for="new-password-input">New Password</label>
        </span>
      </div>
      <div class="input-container">
        <div class="half-width-centered">
          <Button @click="updatePassword" label="Update" class="full-width"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {UpdateEmailDto} from "@/dto/updateEmail.dto";
import {UpdatePasswordDto} from "@/dto/updatePassword.dto";
import {UserDto} from "@/dto/user.dto";
import {UserService} from "@/services/user";


export default defineComponent({
  name: "Profile",
  data() {
    return {
      updateEmailDto: {
        oldEmail: '',
        newEmail: ''
      } as UpdateEmailDto,
      updatePasswordDto: {
        oldPassword: '',
        newPassword: ''
      } as UpdatePasswordDto,
    }
  },
  created() {
    this.resetDataAndFillForm();
  },
  methods: {
    async updateEmail() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.updateEmail(this.$store.getters["authentication/getAccessToken"], this.updateEmailDto);

        this.$toast.add({severity:'success', summary: 'Email updated', detail: result, life: 5000});
        await this.$store.dispatch("user/loadUser");
        this.resetDataAndFillForm();

      } catch (error) {
        this.$toast.add({severity:'error', summary: 'Error on updating email', detail: error.response.data.error, life: 5000});
      }
    },
    async updatePassword() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.updatePassword(this.$store.getters["authentication/getAccessToken"], this.updatePasswordDto);

        this.$toast.add({severity:'success', summary: 'Password updated', detail: result, life: 5000});
        await this.$store.dispatch("user/loadUser");
        this.resetDataAndFillForm();

      } catch (error) {
        this.$toast.add({severity:'error', summary: 'Error on updating password', detail: error.response.data.error, life: 5000});
      }
    },
    resetDataAndFillForm() {
      if(this.user && this.user.email) {
        this.updateEmailDto.oldEmail = this.user.email;
      } else {
        this.updateEmailDto.oldEmail = '';
      }
      this.updateEmailDto.newEmail = '';

      this.updatePasswordDto.oldPassword = '';
      this.updatePasswordDto.newPassword = '';
    }
  },
  computed: {
    user(): UserDto {
      return this.$store.getters['user/getUser'];
    }
  }
});
</script>

<style scoped>
#update-email-form-container, #update-password-form-container {
  position: relative;
  width: 40%;
  height: 320px;
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
#update-password-form-container {
  margin-top: 50px;
}
</style>