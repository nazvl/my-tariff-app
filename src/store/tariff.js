import { defineStore } from "pinia";
import { getTariffs } from "../api/api.js";
import { setItem, getItem, removeItem } from "@/api/idb.js";

export const useTariffStore = defineStore("tariff", {
  state: () => ({
    tariffs: [],
  }),

  actions: {
    async loadFromIDB() {
      const cached = await getItem("tariffs");
      if (cached) {
        this.tariffs = cached;
        return cached;
      }
      return [];
    },

    async fetchTariffs() {
      try {
        let result = await getTariffs();
        await setItem("tariffs", result);
        this.tariffs = result;
        return result;
      } catch (error) {
        console.error("Ошибка при загрузке тарифов:", error);
        throw error;
      }
    },

    async addTariff(newTariff) {
      this.tariffs.push(newTariff);
      // Convert to plain objects before saving to IndexedDB
      const plainTariffs = JSON.parse(JSON.stringify(this.tariffs));
      await setItem("tariffs", plainTariffs);
    },
  },
});
