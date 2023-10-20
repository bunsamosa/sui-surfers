import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
        },
        {
            path: "/city",
            name: "city",
            component: () => import("../views/CityView.vue"),
        },
        {
            path: "/stream",
            name: "stream",
            component: () => import("../views/StreamerView.vue"),
        },
        {
            path: "/playback",
            name: "playback",
            component: () => import("../views/VideoPlayer.vue"),
        },
        {
            path: "/validate",
            name: "validate",
            component: () => import("../views/ValidatorView.vue"),
        }
    ],
});

export default router;
