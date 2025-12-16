import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "./views/Home.vue";
import Quiz from "./views/Quiz.vue";
import Dashboard from "./views/Dashboard.vue";
import WikiPage from "./views/WikiPage.vue";

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
  {
    path: "/wiki/:category",
    name: "Wiki",
    component: WikiPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    // Handle hash scrolling for service anchors
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    return { top: 0 };
  },
});

export default router;
