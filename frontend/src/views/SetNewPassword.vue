<template>
  <div>
    <h1 class="center">Set New Password</h1>
    <div id="reset-password-form-container" class="p-shadow-12">
      <div class="input-container">
        <span class="p-float-label">
          <InputText id="password-input" class="full-width" v-model="passwordDto.password" type="password" />
          <label for="password-input">Password</label>
        </span>
      </div>
      <div class="input-container">
        <div>
          <Button @click="setNewPassword" label="Set Password"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {PasswordDto} from "@/dto/password.dto";
import {UserService} from "@/services/user";


export default defineComponent({
  name: "SetNewPassword",
  data() {
    return {
      passwordDto: {
        password: ''
      } as PasswordDto
    }
  },
  methods: {
    async setNewPassword() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.setNewPassword(this.$route.query.userId, this.$route.query.token, this.passwordDto);

        this.$toast.add({severity: 'success', summary: 'Set New Password', detail: result, life: 5000});

        this.$router.push('/');

      } catch (error) {
        console.error(error);
        this.$toast.add({severity:'error', summary: 'Error on setting new password', detail: error, life: 5000});
      }
    }
  }
});
</script>

<style scoped>
#reset-password-form-container {
  position: relative;
  width: 40%;
  height: 200px;
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