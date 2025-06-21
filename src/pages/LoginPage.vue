<script setup>
import { ref } from 'vue';
import { login } from '@/api/api.js'

let username = ref('');
let password = ref('');
let errorText = ref(null);
if (password !== '' && login !== '') {

}

async function sendLogin() {
    if (username !== '' && password !== '') {
        try {
            let result = await login(username.value, password.value);
            return result;
        }
        catch (error) {
            errorText.value = error.error;
            console.log(error.error);
        }
    }
}

</script>

<template>
    <div class="login-container">
        <h1>Авторизация</h1>
        <input type="text" placeholder="Логин" v-model="username">
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