import { defineStore } from "pinia";
import { getTariffs } from "../api/api.js";
import { setItem, getItem, removeItem } from "@/api/idb.js";

export const useTariffStore = defineStore("tariff", {
  state: () => ({
    tariffs: [],
  }),

  actions: {
    // Загрузка тарифов из IndexedDB
    async loadFromIDB() {
      const cached = await getItem("tariffs");
      if (cached) {
        this.tariffs = cached;
        return cached;
      }
      return [];
    },

    // Получение тарифов из API с объединением локальных данных
    async fetchTariffs() {
      try {
        // Загружаем существующие тарифы из локального хранилища
        const existingTariffs = await this.loadFromIDB();
        
        // Получаем актуальные тарифы из API
        let apiTariffs = await getTariffs();
        
        // Фильтруем локальные тарифы, исключая дубликаты из API
        // Сравниваем по значению и QR-кодам
        const localTariffs = existingTariffs.filter(tariff => 
          !apiTariffs.some(apiTariff => 
            apiTariff.val === tariff.val && 
            JSON.stringify(apiTariff.qrs) === JSON.stringify(tariff.qrs)
          )
        );
        
        // Объединяем тарифы: сначала из API, затем уникальные локальные
        const allTariffs = [...apiTariffs, ...localTariffs];
        
        // Сохраняем объединенный список в IndexedDB и обновляем состояние
        await setItem("tariffs", allTariffs);
        this.tariffs = allTariffs;
        
        return allTariffs;
      } catch (error) {
        console.error("Ошибка при загрузке тарифов:", error);
        // При ошибке API возвращаем данные из локального хранилища
        return await this.loadFromIDB();
      }
    },

    // Добавление нового тарифа в список и сохранение в IndexedDB
    async addTariff(newTariff) {
      this.tariffs.push(newTariff);
      // Преобразуем в обычные объекты для сохранения в IndexedDB
      const plainTariffs = JSON.parse(JSON.stringify(this.tariffs));
      await setItem("tariffs", plainTariffs);
    },
  },
});