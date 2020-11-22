<template>
  <div id="update-email-form-container" class="p-shadow-12">
    <h4 class="center">Update Email</h4>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="current-email-input"
          class="full-width"
          v-model="updateEmailDto.oldEmail"
        />
        <label for="current-email-input">Current Email</label>
      </span>
    </div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="new-email-input"
          class="full-width"
          v-model="updateEmailDto.newEmail"
        />
        <label for="new-email-input">New Email</label>
      </span>
    </div>
    <div class="input-container">
      <div>
        <Button @click="updateEmail" label="Update Email" class="center" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { UpdateEmailDto } from "@/dto/updateEmail.dto";
import { UserService } from "@/services/user";
import { UserDto } from "@/dto/user.dto";

export default defineComponent({
  name: "TheUpdateEmailCard",
  data() {
    return {
      updateEmailDto: {
        oldEmail: "",
        newEmail: "",
      } as UpdateEmailDto,
    };
  },
  created() {
    this.resetForm();
  },
  methods: {
    async updateEmail() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.updateEmail(
          this.$store.getters["authentication/getAccessToken"],
          this.updateEmailDto
        );

        this.$toast.add({
          severity: "success",
          summary: "Email updated",
          detail: result,
          life: 5000,
        });
        await this.$store.dispatch("user/loadUser");
        this.resetForm();
      } catch (error) {
        this.$toast.add({
          severity: "error",
          summary: "Error on updating email",
          detail: error.response.data.error,
          life: 5000,
        });
      }
    },
    resetForm() {
      if (this.user && this.user.email) {
        this.updateEmailDto.oldEmail = this.user.email;
      } else {
        this.updateEmailDto.oldEmail = "";
      }
      this.updateEmailDto.newEmail = "";
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
#update-email-form-container {
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
