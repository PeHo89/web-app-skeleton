import { AuthenticationState } from "@/store/authentication";
import { UserState } from "@/store/user";

declare module "@vue/runtime-core" {
  // Declare your own store states.
  interface State extends AuthenticationState, UserState {}

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
