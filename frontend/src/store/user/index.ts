import { UserService } from "@/services/user";
import { UserDto } from "@/dto/user.dto";

export interface UserState {
  user: UserDto;
  profileImage: string;
}

export default {
  namespaced: true,
  state: {
    user: {} as UserDto,
    profileImage: "",
  } as UserState,
  mutations: {
    setUser(state: any, user: UserDto) {
      state.user = user;
    },
    clearUser(state: any) {
      state.user = {} as UserDto;
    },
    setProfileImage(state: any, profileImage: string) {
      state.profileImage = `data:image/jpeg;base64,${profileImage}`;
    },
    clearProfileImage(state: any) {
      state.profileImage = "";
    },
  },
  actions: {
    setUser(context: any, payload: UserDto) {
      context.commit("setUser", payload);
    },
    clearUser(context: any) {
      context.commit("clearUser");
    },
    setProfileImage(context: any, payload: string) {
      context.commit("setProfileImage", payload);
    },
    clearProfileImage(context: any) {
      context.commit("clearProfileImage");
    },
    async loadUser(context: any) {
      if (!context.rootGetters["authentication/isLoggedIn"]) {
        return;
      }

      const userService = UserService.getSingletonInstance();

      const userDto = await userService.getUserProfile(
        context.rootGetters["authentication/getAccessToken"]
      );

      if (userDto) {
        context.dispatch("setUser", userDto);
        context.dispatch("loadProfileImage");
      }
    },
    async loadProfileImage(context: any) {
      if (!context.rootGetters["authentication/isLoggedIn"]) {
        return;
      }

      const userService = UserService.getSingletonInstance();

      const profileImage = await userService.getUserProfileImage(
        context.rootGetters["authentication/getAccessToken"]
      );

      if (profileImage) {
        context.dispatch("setProfileImage", profileImage);
      }
    },
  },
  getters: {
    getUser(state: any): UserDto {
      return state.user;
    },
    isAdmin(state: any): boolean {
      if (state.user && state.user.roles) {
        return state.user.roles.includes("admin");
      } else {
        return false;
      }
    },
    getProfileImage(state: any): any {
      return state.profileImage;
    },
  },
};
