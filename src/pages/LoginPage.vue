<script setup>
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore();
const router = useRouter();

let login = ref('');
let password = ref('');
let errorText = ref(null);

onBeforeMount(async () => {
    await isAuthorized();
});

// функция для проверки авторизации пользователя и передачи его токена на проверку
async function isAuthorized() {
    // Сначала инициализируем токен из IndexedDB
    await authStore.initAuth();
    
    if (authStore.isAuthenticated) {
        router.push('/tariffs');
    } else {
        console.log('Пользователь не авторизован');
    }
}

// Функция авторизации
async function sendLogin() {
    if (login.value && password.value) {
        try {
            await authStore.login(login.value, password.value);
            // Добавлен редирект после успешного логина
            router.push('/tariffs');
        }
        catch (err) {
            errorText.value = err.message;
        }
    }
}

async function logout() {
    await authStore.logout();
}

</script>

<template>
            <button @click="logout">Выйти</button>
    <p>{{ authStore }}</p>
    <div class="login-container">
        <h1>Авторизация</h1>
        <input type="text" placeholder="Логин" v-model="login">
        <input type="password" placeholder="Пароль" v-model="password">
        <button @click="sendLogin">Войти</button>
        <div class="error" v-if="errorText != null">
            <p>{{ errorText }}</p>
        </div>
    </div>
</template>



<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1.5rem;
    padding: 2rem;
    font-family: 'Arial', sans-serif;
}

.login-container h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;

}

.login-container input {
    width: 100%;
    max-width: 300px;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: 1px solid black;
}

.login-container input:focus {
    outline: none;
    transform: translateY(-2px);
}

.login-container input::placeholder {
    color: #999;
}


.login-container button {
    padding: 1rem 1.5rem;
    background-color: white;
    border-radius: 5px;
    width: 100%;
    max-width: 300px;
    font-size: 16px;
    color: white;
    background-color: blue;
    transition: 300ms;

}

.error {
    background-color: red;
    border: 1px solid black;
    color: white;

    padding: 10px;
    max-width: 300px;

}

.login-container button:hover {
    background-color: darkblue;
}
</style>