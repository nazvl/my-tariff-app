<script setup>
import { ref } from 'vue'

let login = ref('');
let password = ref('');

// Функция отправки данных
async function sendData() {

    console.log('Логин:', login.value);
    console.log('Пароль:', password.value);

}
</script>

<template>
  <div class="login-container">
    <h1>Авторизация</h1>
    <input type="text" placeholder="Логин" v-model="login">
    <input type="password" placeholder="Пароль" v-model="password">
    <button @click="sendData">Войти</button>
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


.login-container button:hover {
    background-color: darkblue;
}
</style>