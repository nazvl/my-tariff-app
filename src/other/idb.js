import { openDB } from 'idb';

const DB_NAME = 'tariff-app';
const DB_VERSION = 1;
const AUTH_STORE = 'auth';
const TARIFFS_STORE = 'tariffs';

/**
 * Инициализация базы данных IndexedDB
 * Создает базу данных с двумя хранилищами: auth и tariffs
 * @returns {Promise<IDBPDatabase>} Промис с объектом базы данных
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TARIFFS_STORE)) {
        const tariffsStore = db.createObjectStore(TARIFFS_STORE, { keyPath: 'id', autoIncrement: true });
        tariffsStore.createIndex('created', 'created');
        tariffsStore.createIndex('processed', 'processed');
      }
    },
  });
}

// ===== ФУНКЦИИ АВТОРИЗАЦИИ =====

/**
 * Сохраняет токен авторизации в IndexedDB
 * Вызывается из src/stores/auth.js после успешного логина
 * @param {string} token - JWT токен или строка токена от сервера(mockData) авторизации
 * @returns {Promise<void>} Промис без возвращаемого значения
 */
async function saveToken(token) {
  const db = await initDB();
  await db.put(AUTH_STORE, { id: 'token', value: token });
}

/**
 * Получает сохраненный токен авторизации из IndexedDB
 * Вызывается из src/stores/auth.js при инициализации приложения
 * @returns {Promise<string|null>} Промис с токеном или null если токен не найден
 */
async function getToken() {
  const db = await initDB();
  const result = await db.get(AUTH_STORE, 'token');
  return result ? result.value : null;
}

/**
 * Удаляет токен авторизации из IndexedDB
 * Вызывается из src/stores/auth.js при выходе пользователя из системы
 * @returns {Promise<void>} Промис без возвращаемого значения
 */
async function removeToken() {
  const db = await initDB();
  await db.delete(AUTH_STORE, 'token');
}

// ===== ТАРИФНЫЕ ФУНКЦИИ =====

/**
 * Сохраняет новый тариф в IndexedDB
 * Вызывается из src/stores/tariffs.js при создании нового тарифа
 * @param {Object} tariff - Объект тарифа
 * @param {string|number} tariff.val - Значение тарифа (T1, T2, T3 или числовое значение)
 * @param {string[]} tariff.qrs - Массив QR-кодов
 * @param {boolean} tariff.processed - Признак обработки на сервере (по умолчанию false)
 * @param {string} [tariff.created] - ISO строка даты создания (если не передана, устанавливается текущая)
 * @returns {Promise<number>} Промис с ID созданного тарифа
 */
async function saveTariff(tariff) {
  const db = await initDB();
  const tariffWithId = {
    ...tariff,
    created: tariff.created || new Date().toISOString()
  };
  return await db.add(TARIFFS_STORE, tariffWithId);
}

/**
 * Получает все тарифы из IndexedDB
 * Вызывается из src/stores/tariffs.js для загрузки списка тарифов
 */
async function getAllTariffs() {
  const db = await initDB();
  return await db.getAll(TARIFFS_STORE);
}

/**
 * Обновляет существующий тариф в IndexedDB
 * Вызывается из src/stores/tariffs.js для изменения статуса или других полей тарифа
 * @param {number} id - ID тарифа в IndexedDB
 * @param {Object} updates - Объект с полями для обновления
 * @param {boolean} [updates.processed] - Новый статус обработки
 * @param {string[]} [updates.qrs] - Обновленный массив QR-кодов
 * @param {string|number} [updates.val] - Новое значение тарифа
 * @returns {Promise<Object|null>} Промис с обновленным объектом тарифа или null если не найден
 */
async function updateTariff(id, updates) {
  const db = await initDB();
  const tariff = await db.get(TARIFFS_STORE, id);
  if (tariff) {
    const updatedTariff = { ...tariff, ...updates };
    await db.put(TARIFFS_STORE, updatedTariff);
    return updatedTariff;
  }
  return null;
}

/**
 * Удаляет тариф из IndexedDB
 * Вызывается из src/stores/tariffs.js при удалении тарифа пользователем
&*/

async function deleteTariff(id) {
  const db = await initDB();
  await db.delete(TARIFFS_STORE, id);
}

/**
 * Очищает все тарифы из IndexedDB
 * Вызывается из src/stores/tariffs.js для полной очистки данных
 * Может использоваться при сбросе данных или выходе пользователя
*/

async function clearAllTariffs() {
  const db = await initDB();
  await db.clear(TARIFFS_STORE);
}

export { 
  saveToken, 
  getToken, 
  removeToken,
  saveTariff,
  getAllTariffs,
  updateTariff,
  deleteTariff,
  clearAllTariffs
};