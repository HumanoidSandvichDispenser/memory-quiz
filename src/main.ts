import { createApp } from "vue";
import App from "./App.vue";

// eslint-disable
import Vue3Katex from "@hsorby/vue3-katex";
import "katex/dist/katex.min.css";

createApp(App)
    .use(Vue3Katex)
    .mount("#app");
