<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";

const authStore = useAuthStore();
const router = useRouter();

let username = ref(null);
let password = ref(null);
let errorText = ref({ text: null, color: "red" });

onMounted(async () => {
  const isAuthenticated = await authStore.checkToken();
  if (isAuthenticated) {
    console.log('Пользователь уже авторизован');
    router.push("/tariffs");
  }
});

async function sendLogin() {
  errorText.value.text = null;
  if (
    !username.value ||
    !password.value ||
    username.value.trim() === "" ||
    password.value.trim() === ""
  ) {
    errorText.value.color = "yellow";
    errorText.value.text = "Необходимо заполнить все поля";
    return;
  }
  
  try {
    await authStore.login(username.value, password.value);
    router.push("/tariffs");
  } catch (error) {
    errorText.value.text = error.error;
    console.log(error.error);
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Авторизация</h1>
    <input type="text" placeholder="Логин" v-model="username" />
    <input type="password" placeholder="Пароль" v-model="password" />
    <button @click="sendLogin">Войти</button>
    <div
      class="error"
      v-if="errorText.text != null"
      :style="{ backgroundColor: errorText.color }"
    >
      <p>{{ errorText.text }}</p>
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
  font-family: "Arial", sans-serif;
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
  padding: 10px;
  max-width: 300px;
  color: black;
}

.login-container button:hover {
  background-color: darkblue;
}
</style>
