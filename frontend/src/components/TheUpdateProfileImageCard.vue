<template>
  <div id="update-profile-image-form-container" class="p-shadow-12">
    <h4 class="center">Update Profile Image</h4>
    <div class="image-container">
      <img v-if="profileImage" class="profile-image" :src="profileImage" />
      <img
          v-else
          class="profile-image"
          src="/img/profile_image_placeholder.png"
      />
    </div>
    <div class="image-container">
      <div>
        <FileUpload
            name="profileImage"
            accept="image/*"
            :url="profileImageUrl"
            @before-send="beforeUpload"
            @upload="afterUpload"
            @error="uploadError"
        >
          <template #empty>
            <p>Drag and drop or select profile image to upload.</p>
          </template>
        </FileUpload>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";


export default defineComponent({
  name: "TheUpdateProfileImageCard",
  data() {
    return {
      profileImageUrl: `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/user/profile/image`,
    }
  },
  methods: {
    beforeUpload(request: any) {
      request.xhr.setRequestHeader(
          "Authorization",
          `Bearer ${this.$store.getters["authentication/getAccessToken"]}`
      );
      return request;
    },
    afterUpload() {
      this.$toast.add({
        severity: "success",
        summary: "Profile image updated",
        detail: "Successfully uploaded profile image",
        life: 5000,
      });
      this.$store.dispatch("user/loadUser");
    },
    uploadError() {
      this.$toast.add({
        severity: "error",
        summary: "Error on updating password",
        detail: "Error on uploading profile image",
        life: 5000,
      });
    },
  },
  computed: {
    profileImage(): string | null {
      if (this.$store.getters["user/getProfileImage"]) {
        return this.$store.getters["user/getProfileImage"];
      } else {
        return null;
      }
    },
  },
});
</script>

<style scoped>
#update-profile-image-form-container {
  position: relative;
  width: 40%;
  height: 650px;
  left: 30%;
  padding: 20px;
  top: 50px;
}
.image-container {
  position: relative;
  text-align: center;
  padding-top: 10px;
}
.profile-image {
  max-height: 300px;
}
</style>