import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'


import { initDB } from './other/idb.js'

async function initApp() {
    await initDB();
    
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
}

initApp();