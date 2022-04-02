import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "mainPage",
    component: () => import("../views/mainPage"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
