import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, 
    token: null,
  }),

  actions: {
    setAuth(user, token) {
      this.user = user;
      this.token = token;
      // Сохраняем в localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },

    checkToken() {
      // Проверяем наличие токена
      if (this.token) {
        return true;
      }

      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        this.token = savedToken;
        this.user = JSON.parse(savedUser);
        return true;
      }
      
      return false;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});