import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import TarriffsListPage from '@/pages/TarriffsListPage.vue'
import SetTarriffPage from '@/pages/SetTarriffPage.vue'


const routes = [
    { path: '/login', component: LoginPage },
    { path: '/tariffs', component: TarriffsListPage },
    { path: '/apply', component: SetTarriffPage },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
