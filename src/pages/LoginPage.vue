<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";
import { useTariffStore } from "../store/tariff";
const authStore = useAuthStore();
const tariffStore = useTariffStore()
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

// onBeforeUnmount(async () => {
//     const isAuthenticated = await authStore.checkToken();
//     if (isAuthenticated) {
//       tariffStore.loadFromIDB(); // подгрузка из idb 
//     }
//   }
// )

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
  height: 100dvh;
  min-height: -webkit-fill-available;
  gap: 1rem;
  padding: 1rem;
  font-family: "Arial", sans-serif;
  box-sizing: border-box;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
}

.login-container h1 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  margin: 0;
  margin-bottom: 1rem;
  flex-shrink: 0;
  color: #2e7d32;
  font-weight: 600;
}

.login-container input {
  width: 100%;
  max-width: 300px;
  padding: 0.8rem 1rem;
  border: 2px solid #a5d6a7;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  flex-shrink: 0;
  background: white;
}

.login-container input:focus {
  outline: none;
  border-color: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.login-container input::placeholder {
  color: #81c784;
}

.login-container button {
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
  border: none;
  box-sizing: border-box;
  flex-shrink: 0;
  font-weight: 500;
  cursor: pointer;
}

.login-container button:hover {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.error {
  background-color: #ffebee;
  border: 2px solid #e57373;
  padding: 0.5rem;
  max-width: 300px;
  color: #d32f2f;
  border-radius: 8px;
  text-align: center;
  flex-shrink: 0;
}

.error p {
  margin: 0;
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