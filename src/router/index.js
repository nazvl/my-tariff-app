import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import TarriffsListPage from '@/pages/TarriffsListPage.vue'
import SetTarriffPage from '@/pages/SetTarriffPage.vue'
import { useAuthStore } from '@/store/auth.js'

const routes = [
    { 
        path: '/login', 
        component: LoginPage,
        meta: { requiresAuth: false }
    },
    { 
        path: '/tariffs', 
        component: TarriffsListPage,
        meta: { requiresAuth: true }
    },
    { 
        path: '/apply', 
        component: SetTarriffPage,
        meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // Проверяем, требует ли маршрут авторизации
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    
    if (requiresAuth) {
        // Проверяем, авторизован ли пользователь
        const isAuthenticated = await authStore.checkToken()
        
        if (!isAuthenticated) {
            // Если не авторизован, перенаправляем на страницу входа
            next('/login')
        } else {
            // Если авторизован, продолжаем навигацию
            next()
        }
    } else {
        // Если маршрут не требует авторизации
        if (to.path === '/login') {
            // Если пользователь уже авторизован и пытается зайти на страницу входа
            const isAuthenticated = await authStore.checkToken()
            if (isAuthenticated) {
                next('/tariffs')
            } else {
                next()
            }
        } else {
            next()
        }
    }
})

export default router