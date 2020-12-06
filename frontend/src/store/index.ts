import { createStore } from "vuex";
import AuthenticationStore from "./authentication/index";
import UserStore from "./user/index";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  getters: {},
  modules: {
    authentication: AuthenticationStore,
    user: UserStore
  }
});
