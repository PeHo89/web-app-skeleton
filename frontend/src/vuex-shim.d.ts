import { AuthenticationState } from "@/store/authentication";

declare module "@vue/runtime-core" {
  // Declare your own store states.
  interface State extends AuthenticationState {}

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
