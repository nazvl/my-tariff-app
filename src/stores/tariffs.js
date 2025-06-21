import { defineStore } from "pinia";
import { ref } from "vue";
import { 
    getAllTariffs, 
    saveTariff, 
    updateTariff, 
    deleteTariff 
} from "@/other/idb.js";
import { getTariffsFromServer } from "@/services/tariffs.js";

/**
 * Pinia store для управления тарифами
 * Предоставляет функции для загрузки, добавления, обновления и удаления тарифов
 */
export const useTariffsStore = defineStore("tariffs", () => {
    // Реактивный массив всех тарифов
    const tariffs = ref([]);
    
    // Флаг состояния загрузки для отображения индикаторов
    const loading = ref(false);

    /**
     * Загружает все тарифы из IndexedDB
     * Устанавливает состояние загрузки во время выполнения операции
     */
    const loadTariffs = async () => {
        loading.value = true;
        try {
            tariffs.value = await getAllTariffs();
        } catch (error) {
            console.error("Ошибка загрузки тарифов:", error);
        } finally {
            loading.value = false;
        }
    };

    /**
     * Добавляет новый тариф в базу данных и локальный store
     * @param {Object} tariffData - Данные нового тарифа
     * @returns {Promise<number>} ID созданного тарифа
     */
    const addTariff = async (tariffData) => {
        try {
            const id = await saveTariff(tariffData);
            const newTariff = { ...tariffData, id };
            tariffs.value.push(newTariff);
            return id;
        } catch (error) {
            console.error("Ошибка сохранения тарифа:", error);
            throw error;
        }
    };

    /**
     * Обновляет существующий тариф
     * @param {number} id - ID тарифа для обновления
     * @param {Object} updates - Объект с обновляемыми полями
     * @returns {Promise<Object>} Обновленный объект тарифа
     */
    const editTariff = async (id, updates) => {
        try {
            const updatedTariff = await updateTariff(id, updates);
            if (updatedTariff) {
                // Находим и обновляем тариф в локальном массиве
                const index = tariffs.value.findIndex(t => t.id === id);
                if (index !== -1) {
                    tariffs.value[index] = updatedTariff;
                }
            }
            return updatedTariff;
        } catch (error) {
            console.error("Ошибка обновления тарифа:", error);
            throw error;
        }
    };

    /**
     * Удаляет тариф из базы данных и локального store
     * @param {number} id - ID тарифа для удаления
     */
    const removeTariff = async (id) => {
        try {
            await deleteTariff(id);
            // Удаляем тариф из локального массива
            tariffs.value = tariffs.value.filter(t => t.id !== id);
        } catch (error) {
            console.error("Ошибка удаления тарифа:", error);
            throw error;
        }
    };

    /**
     * Загружает тарифы с сервера и сохраняет в IndexedDB
     */
    const loadTariffsFromServer = async () => {
        loading.value = true;
        try {
            const serverTariffs = await getTariffsFromServer();
            await loadTariffs(); // Перезагружаем из IndexedDB после сохранения
        } catch (error) {
            console.error("Ошибка загрузки тарифов с сервера:", error);
        } finally {
            loading.value = false;
        }
    };

    // Возвращаем публичный API store
    return {
        tariffs,
        loading,
        loadTariffs,
        loadTariffsFromServer, // Добавляем новую функцию
        addTariff,
        editTariff,
        removeTariff
    };
});