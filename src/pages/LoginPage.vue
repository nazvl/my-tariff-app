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
  height: 100vh;
  height: 100dvh;
  min-height: -webkit-fill-available;
  gap: 1rem;
  padding: 1rem;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
  overflow: hidden;
}

.login-container h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  margin: 0;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.login-container input {
  width: 100%;
  max-width: 300px;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 1px solid black;
  box-sizing: border-box;
  flex-shrink: 0;
}

.login-container input:focus {
  outline: none;
  transform: translateY(-2px);
}

.login-container input::placeholder {
  color: #999;
}

.login-container button {
  padding: 0.8rem 1rem;
  background-color: white;
  border-radius: 5px;
  width: 100%;
  max-width: 300px;
  font-size: 16px;
  color: white;
  background-color: blue;
  transition: 300ms;
  border: none;
  box-sizing: border-box;
  flex-shrink: 0;
}

.error {
  background-color: red;
  border: 1px solid black;
  padding: 0.5rem;
  max-width: 300px;
  color: black;
  border-radius: 5px;
  text-align: center;
  flex-shrink: 0;
}

.error p {
  margin: 0;
}

.login-container button:hover {
  background-color: darkblue;
}

@media (max-height: 600px) {
  .login-container {
    gap: 0.5rem;
  }
  
  .login-container h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>
