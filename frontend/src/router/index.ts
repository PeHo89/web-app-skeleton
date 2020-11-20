import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
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
      //user must be authenticated
      authenticationRequired: true,
    },
    component: () =>
      import(/* webpackChunkName: "profile" */ "../views/Profile.vue"),
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      //user must be un-authenticated
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
    path: "/resetpassword",
    name: "ResetPassword",
    meta: {
      authenticationRequired: false,
    },
    component: () =>
      import(
        /* webpackChunkName: "resetpassword" */ "../views/ResetPassword.vue"
      ),
  },
  {
    path: "/setnewpassword",
    name: "SetNewPassword",
    meta: {
      authenticationRequired: false,
    },
    component: () =>
      import(
        /* webpackChunkName: "setnewpassword" */ "../views/SetNewPassword.vue"
      ),
  },
  {
    path: "/admin",
    name: "Admin",
    meta: {
      //user must has admin role
      requiredRole: "admin",
    },
    component: () =>
      import(/* webpackChunkName: "admin" */ "../views/Admin.vue"),
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
  //handle requiredRole in route meta data
  if (to.meta.requiredRole !== undefined) {
    const userRoles = store.getters["user/getUser"].roles;

    if (userRoles && userRoles.includes(to.meta.requiredRole)) {
      next();
      return;
    } else {
      next("/");
      return;
    }
  }

  //handle authenticationRequired in route meta data
  if (to.meta.authenticationRequired !== undefined) {
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
  }
  next();
  return;
});

export default router;
