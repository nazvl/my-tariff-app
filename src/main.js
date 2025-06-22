import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { QrcodeStream } from 'vue-qrcode-reader';
import './style.css'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component('QrcodeStream', QrcodeStream);  
app.mount("#app");
