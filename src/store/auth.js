import { defineStore } from "pinia";
<<<<<<< HEAD
import { login } from "@/api/api.js";
import { setItem, getItem, removeItem } from "@/api/idb.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
=======

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, 
>>>>>>> de5c56f (realizated login (temporary with localstorage))
    token: null,
  }),

  actions: {
<<<<<<< HEAD
    async login(user, password) {
      try {
        let result = await login(user, password);
        this.setAuth(result.user.login, result.token);
        await setItem("username", result.user.login);
        await setItem("token", result.token);
        return result;
      } catch (error) {
        throw error;
      }
    },

    setAuth(user, token) {
      this.user = user;
      this.token = token;
    },

    async checkToken() {
      // Проверяем наличие токена в store
      if (this.token) {
        return this.isValidToken(this.token);
      }

      // Проверяем сохраненный токен
      const savedToken = await getItem("token");
      const savedUser = await getItem("username");

      if (savedToken && savedUser) {
        // Проверяем валидность сохраненного токена
        if (this.isValidToken(savedToken)) {
          this.token = savedToken;
          this.user = savedUser;
          return true;
        } else {
          // Токен невалиден, очищаем его
          await this.logout();
          return false;
        }
      }

      return false;
    },

    isValidToken(token) {
      // Здесь должна быть реальная проверка токена
      // Для mock данных проверяем, что токен соответствует одному из пользователей
      const validTokens = ["fake-token-123456", "token-987654321"];
      return validTokens.includes(token);
    },

    async logout() {
      this.user = null;
      this.token = null;
      await removeItem("username");
      await removeItem("token");
=======
    setAuth(user, token) {
      this.user = user;
      this.token = token;
    },

    async checkToken() {
      // Проверяем наличие токена в store
      if (this.token) {
        return this.isValidToken(this.token);
      }

      // Проверяем сохраненный токен
      const savedToken = await getItem("token");
      const savedUser = await getItem("username");

      if (savedToken && savedUser) {
        // Проверяем валидность сохраненного токена
        if (this.isValidToken(savedToken)) {
          this.token = savedToken;
          this.user = savedUser;
          return true;
        } else {
          // Токен невалиден, очищаем его
          await this.logout();
          return false;
        }
      }

      return false;
    },

    isValidToken(token) {
      // Здесь должна быть реальная проверка токена
      // Для mock данных проверяем, что токен соответствует одному из пользователей
      const validTokens = ["fake-token-123456", "token-987654321"];
      return validTokens.includes(token);
    },

    async logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
>>>>>>> de5c56f (realizated login (temporary with localstorage))
    },
  },
});