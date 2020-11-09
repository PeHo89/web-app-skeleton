<template>
  <Menubar :model="structure">
    <template #start>
      [APP LOGO]
    </template>
    <template #end>
      <InputText v-model="loginData.username" placeholder="Email" />
      <Password v-model="loginData.password" :feedback="false" placeholder="Password" />
      <Button @click="login" label="Login" />
    </template>
  </Menubar>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {AuthenticationService} from "@/services/authentication";
import {LoginDto} from '../dto/login.dto';

export default defineComponent({
  name: "TheMenubar",
  data() {
    return {
      structure: [
        {
          label:'File',
          icon:'pi pi-fw pi-file',
          items:[
            {
              label:'New',
              icon:'pi pi-fw pi-plus',
              items:[
                {
                  label:'Bookmark',
                  icon:'pi pi-fw pi-bookmark'
                },
                {
                  label:'Video',
                  icon:'pi pi-fw pi-video'
                },

              ]
            },
            {
              label:'Delete',
              icon:'pi pi-fw pi-trash'
            },
            {
              separator:true
            },
            {
              label:'Export',
              icon:'pi pi-fw pi-external-link'
            }
          ]
        }
      ],
      loginData: {
        username: '',
        password: '',
      } as LoginDto,
      authenticationService: {} as AuthenticationService
    }
  },
  created() {
    console.log(process.env.VUE_APP_NAME);
    this.authenticationService = AuthenticationService.getSingletonInstance();
  },
  methods: {
    async login() {
      const result = await this.authenticationService.login(this.loginData);
      if (!result) {
        console.error('login error')
      } else {
        console.log(result.accessToken);
      }
    }
  }
});
</script>

<style scoped>

</style>