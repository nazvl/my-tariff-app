import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { loginF, validateToken } from "@/services/auth.js";
import { saveToken, getToken, removeToken } from "@/other/idb.js";

export const useAuthStore = defineStore("auth", () => {
  const token = ref("");
  const isAuthenticated = computed(() => !!token.value);

  // Инициализация токена из IndexedDB
  const initializeToken = async () => {
    const storedToken = await getToken();
    if (storedToken) {
      token.value = storedToken;
    }
  };

  const login = async (login, password) => {
    try {
      const response = await loginF(login, password);
      token.value = response.token;
      await saveToken(response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const checkToken = async () => {
    if (!token.value) {
      return false;
    }

    try {
      const response = await validateToken(token.value);
      return response.valid;
    } catch (error) {
      // Если токен недействителен, очищаем его
      logout();
      return false;
    }
  };

  const logout = async () => {
    token.value = "";
    await removeToken();
  };

  // Инициализация с проверкой токена
  const initAuth = async () => {
    await initializeToken();
    if (token.value) {
      const isValid = await checkToken();
      if (!isValid) {
        console.log("Токен недействителен, требуется повторная авторизация");
      }
    }
  };

  return {
    token,
    isAuthenticated,
    login,
    logout,
    checkToken,
    initAuth
  };
});