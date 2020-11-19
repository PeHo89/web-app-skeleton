import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import store from "../store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    alias: ["/home"],
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ "../views/Home.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    meta: {
      authenticationRequired: true,
    },
    component: () =>
      import(/* webpackChunkName: "profile" */ "../views/Profile.vue"),
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      authenticationRequired: false,
    },
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
  },
  {
    path: "/signup",
    name: "SignUp",
    meta: {
      authenticationRequired: false,
    },
    component: () =>
      import(/* webpackChunkName: "signup" */ "../views/SignUp.vue"),
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/termsconditions",
    name: "TermsConditions",
    component: () =>
      import(
        /* webpackChunkName: "termsconditions" */ "../views/TermsConditions.vue"
      ),
  },
  {
    path: "/:notfound",
    name: "NotFound",
    component: () =>
      import(/* webpackChunkName: "notfound" */ "../views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.authenticationRequired === undefined) {
    next();
    return;
  }

  if (
    to.meta.authenticationRequired === true &&
    !store.getters["authentication/isLoggedIn"]
  ) {
    next("/login");
    return;
  } else if (
    to.meta.authenticationRequired === false &&
    store.getters["authentication/isLoggedIn"]
  ) {
    next("/profile");
    return;
  }
  next();
  return;
});

export default router;
