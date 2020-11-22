<template>
  <div id="update-personal-information-form-container" class="p-shadow-12">
    <h4 class="center">Update Personal Information</h4>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="first-name-input"
          class="full-width"
          v-model="personalInformation.firstName"
        />
        <label for="first-name-input">First Name</label>
      </span>
    </div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="last-name-input"
          class="full-width"
          v-model="personalInformation.lastName"
        />
        <label for="last-name-input">Last Name</label>
      </span>
    </div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="street-and-number-input"
          class="full-width"
          v-model="personalInformation.streetAndNumber"
        />
        <label for="street-and-number-input">Street & Number</label>
      </span>
    </div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="postal-code-input"
          class="full-width"
          v-model="personalInformation.postalCode"
        />
        <label for="postal-code-input">Postal Code</label>
      </span>
    </div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="city-input"
          class="full-width"
          v-model="personalInformation.city"
        />
        <label for="city-input">City</label>
      </span>
    </div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText
          id="country-input"
          class="full-width"
          v-model="personalInformation.country"
        />
        <label for="country-input">Country</label>
      </span>
    </div>
    <div class="input-container">
      <div>
        <Button
          @click="updatePersonalInformation"
          label="Update Personal Information"
          class="center"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PersonalInformation, UserDto }  from "@/dto/user.dto";
import {UserService} from "@/services/user";

export default defineComponent({
  name: "TheUpdatePersonalInformationCard",
  data() {
    return {
      personalInformation: {
        firstName: "",
        lastName: "",
        streetAndNumber: "",
        city: "",
        postalCode: "",
        country: "",
      } as PersonalInformation,
    };
  },
  created() {
    this.resetForm();
  },
  methods: {
    async updatePersonalInformation() {
      const userService = UserService.getSingletonInstance();

      try {
        const result = await userService.updatePersonalInformation(
            this.$store.getters["authentication/getAccessToken"],
            this.personalInformation
        );

        this.$toast.add({
          severity: "success",
          summary: "Personal information updated",
          detail: result,
          life: 5000,
        });
        await this.$store.dispatch("user/loadUser");
        this.resetForm();
      } catch (error) {
        this.$toast.add({
          severity: "error",
          summary: "Error on updating personal information",
          detail: error.response.data.error,
          life: 5000,
        });
      }
    },
    resetForm() {
      if (this.user && this.user.personalInformation) {
        this.personalInformation = this.user.personalInformation;
      } else {
        this.personalInformation.firstName = "";
        this.personalInformation.lastName = "";
        this.personalInformation.streetAndNumber = "";
        this.personalInformation.postalCode = "";
        this.personalInformation.city = "";
        this.personalInformation.country = "";
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
#update-personal-information-form-container {
  position: relative;
  width: 40%;
  height: 600px;
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
