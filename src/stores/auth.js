import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { loginF, validateToken } from "@/services/auth.js";
import { saveToken, getToken, removeToken } from "@/other/idb.js";

/**
 * Pinia store для управления аутентификацией пользователя
 * Обрабатывает состояние токена, вход, выход и валидацию
 */
export const useAuthStore = defineStore("auth", () => {
  // Реактивное состояние токена аутентификации
  const token = ref("");

  // Вычисляемое свойство для проверки статуса аутентификации
  const isAuthenticated = computed(() => !!token.value);

  /**
   * Инициализирует токен из IndexedDB при загрузке приложения
   * Восстанавливает состояние аутентификации после перезагрузки страницы
   */
  const initializeToken = async () => {
    const storedToken = await getToken();
    if (storedToken) {
      token.value = storedToken;
    }
  };

  /**
   * Выполняет аутентификацию пользователя
   * @param {string} login - Логин пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Promise<Object>} Ответ сервера с токеном
   * @throws {Error} Ошибка аутентификации
   */
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

  /**
   * Проверяет валидность текущего токена на сервере
   * @returns {Promise<boolean>} true если токен валиден, false если нет
   */
  const checkToken = async () => {
    if (!token.value) {
      return false;
    }

    try {
      const response = await validateToken(token.value);
      return response.valid;
    } catch (error) {
      // Если токен недействителен или произошла ошибка, очищаем состояние
      logout();
      return false;
    }
  };

  /**
   * Выполняет выход пользователя из системы
   * Очищает токен из памяти и IndexedDB
   */
  const logout = async () => {
    token.value = "";
    await removeToken();
  };

  /**
   * Инициализирует состояние аутентификации при запуске приложения
   * Загружает токен из хранилища и проверяет его валидность
   */
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
    initAuth,
  };
});
