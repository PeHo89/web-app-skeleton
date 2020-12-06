import { AuthenticationService } from "@/services/authentication";
import { AccessTokenDto } from "@/dto/accessToken.dto";
import { LoginDto } from "@/dto/login.dto";

export interface AuthenticationState {
  accessToken: string;
  expiresAt: number;
  lastModification: Date;
}

export default {
  namespaced: true,
  state: {
    accessToken: "",
    expiresAt: -1,
    lastModification: {} as Date
  } as AuthenticationState,
  mutations: {
    setAccessToken(state: any, accessToken: string) {
      state.accessToken = accessToken;
    },
    clearAccessToken(state: any) {
      state.accessToken = "";
    },
    setLastModificationDate(state: any) {
      state.lastModification = new Date();
    },
    setExpiresAt(state: any, expiresAt: string) {
      state.expiresAt = parseInt(expiresAt);
    },
    clearExpiresAt(state: any) {
      state.expiresAt = -1;
    }
  },
  actions: {
    setTokenAndDates(context: any, payload: AccessTokenDto) {
      context.commit("setAccessToken", payload.accessToken);
      context.commit("setExpiresAt", payload.expiresAt);
      context.commit("setLastModificationDate");
    },
    clearTokenAndDates(context: any) {
      context.commit("clearAccessToken");
      context.commit("clearExpiresAt");
      context.commit("setLastModificationDate");
    },
    async login(context: any, payload: LoginDto): Promise<boolean> {
      const authenticationService = AuthenticationService.getSingletonInstance();

      let accessTokenDto;
      try {
        accessTokenDto = await authenticationService.login(payload);
      } catch (error) {
        console.error(error);
      }

      if (accessTokenDto) {
        context.dispatch("setTokenAndDates", accessTokenDto);

        localStorage.setItem("accessTokenDto", JSON.stringify(accessTokenDto));

        context.dispatch("user/loadUser", null, { root: true });

        return true;
      }
      return false;
    },
    loadFromLocalStorage(context: any) {
      const localStoredAccessTokenDto = localStorage.getItem("accessTokenDto");
      if (localStoredAccessTokenDto) {
        context.dispatch(
          "setTokenAndDates",
          JSON.parse(localStoredAccessTokenDto)
        );
      }
    },
    logout(context: any) {
      context.dispatch("clearTokenAndDates");

      localStorage.removeItem("accessTokenDto");

      context.dispatch("user/clearUser", null, { root: true });
      context.dispatch("user/clearProfileImage", null, { root: true });
    }
  },
  getters: {
    isLoggedIn(state: any): boolean {
      return (
        state.accessToken !== "" &&
        state.expiresAt !== -1 &&
        new Date().getTime() / 1000 < state.expiresAt
      );
    },
    getAccessToken(state: any): string {
      return state.accessToken;
    }
  }
};
