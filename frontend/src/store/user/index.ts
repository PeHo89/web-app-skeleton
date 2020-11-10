import { UserService } from "@/services/user";
import { UserDto } from "@/dto/user.dto";

export interface UserState {
  user: UserDto;
}

export default {
  namespaced: true,
  state: {
    user: {} as UserDto,
  } as UserState,
  mutations: {
    setUser(state: any, user: UserDto) {
      state.user = user;
    },
    clearUser(state: any) {
      state.user = {} as UserDto;
    },
  },
  actions: {
    setUser(context: any, payload: UserDto) {
      context.commit("setUser", payload);
    },
    clearUser(context: any) {
      context.commit("clearUser");
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
      }
    },
  },
  getters: {
    getUser(state: any): UserDto {
      return state.user;
    },
  },
};
