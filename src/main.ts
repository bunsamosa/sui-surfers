import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import VueWriter from "vue-writer";
import Vue3Lottie from "vue3-lottie";
import QrcodeReaderVue3 from "qrcode-reader-vue3";



import "vue3-lottie/dist/style.css";
import "video.js/dist/video-js.css";

// load fonts
loadFonts();

// create vue app
const app = createApp(App);

// add modules and router
app.use(createPinia());
app.use(vuetify);
app.use(VueWriter);
app.use(Vue3Lottie);
app.use(QrcodeReaderVue3);
app.use(router);

// mount app
app.mount("#app");
