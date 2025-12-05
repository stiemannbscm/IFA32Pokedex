import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Details from "./pages/Details.vue";

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/pokemon/:name", name: "Details", component: Details },
  ],
});
