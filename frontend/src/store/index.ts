import { createStore } from "vuex";
import AuthenticationStore from "./authentication/index";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  getters: {},
  modules: {
    authentication: AuthenticationStore,
  },
});
