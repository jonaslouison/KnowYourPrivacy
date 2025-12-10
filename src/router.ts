import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "./views/Home.vue";
import Quiz from "./views/Quiz.vue";
import Dashboard from "./views/Dashboard.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/quiz",
    name: "Quiz",
    component: Quiz,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
