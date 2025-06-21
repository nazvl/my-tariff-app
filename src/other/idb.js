const DB_NAME = 'tariff-app';
const DB_VERSION = 1;
const AUTH_STORE = 'auth';
const TARIFFS_STORE = 'tariffs';

/**
 * Инициализация базы данных IndexedDB
 * Создает базу данных с двумя хранилищами: auth и tariffs
 * @returns {Promise<IDBDatabase>} Промис с объектом базы данных
 */
let db;
let dbPromise;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      
      // Создаем хранилище для токенов авторизации
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE, { keyPath: 'id' });
      }
      
      // Создаем хранилище для тарифов
      if (!db.objectStoreNames.contains(TARIFFS_STORE)) {
        db.createObjectStore(TARIFFS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
  
  return dbPromise;
};

// Helper function to get database connection
const getDB = async () => {
  if (db && !db.objectStoreNames.contains(TARIFFS_STORE)) {
    // Database exists but doesn't have our stores, reinitialize
    db = null;
    dbPromise = null;
  }
  
  if (!db) {
    db = await initDB();
  }
  return db;
};

// ===== ФУНКЦИИ АВТОРИЗАЦИИ =====

async function saveToken(token) {
  const database = await getDB();
  const transaction = database.transaction([AUTH_STORE], 'readwrite');
  const store = transaction.objectStore(AUTH_STORE);
  return new Promise((resolve, reject) => {
    const request = store.put({ id: 'token', value: token });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getToken() {
  const database = await getDB();
  const transaction = database.transaction([AUTH_STORE], 'readonly');
  const store = transaction.objectStore(AUTH_STORE);
  return new Promise((resolve, reject) => {
    const request = store.get('token');
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => reject(request.error);
  });
}

async function removeToken() {
  const database = await getDB();
  const transaction = database.transaction([AUTH_STORE], 'readwrite');
  const store = transaction.objectStore(AUTH_STORE);
  return new Promise((resolve, reject) => {
    const request = store.delete('token');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ===== ТАРИФНЫЕ ФУНКЦИИ =====

async function saveTariff(tariff) {
  const database = await getDB();
  const tariffWithId = {
    ...tariff,
    created: tariff.created || new Date().toISOString()
  };
  const transaction = database.transaction([TARIFFS_STORE], 'readwrite');
  const store = transaction.objectStore(TARIFFS_STORE);
  return new Promise((resolve, reject) => {
    const request = store.add(tariffWithId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllTariffs() {
  const database = await getDB();
  const transaction = database.transaction([TARIFFS_STORE], 'readonly');
  const store = transaction.objectStore(TARIFFS_STORE);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function updateTariff(id, updates) {
  const database = await getDB();
  const transaction = database.transaction([TARIFFS_STORE], 'readwrite');
  const store = transaction.objectStore(TARIFFS_STORE);
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const tariff = getRequest.result;
      if (tariff) {
        const updatedTariff = { ...tariff, ...updates };
        const putRequest = store.put(updatedTariff);
        putRequest.onsuccess = () => resolve(updatedTariff);
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve(null);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

async function deleteTariff(id) {
  const database = await getDB();
  const transaction = database.transaction([TARIFFS_STORE], 'readwrite');
  const store = transaction.objectStore(TARIFFS_STORE);
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearAllTariffs() {
  const database = await getDB();
  const transaction = database.transaction([TARIFFS_STORE], 'readwrite');
  const store = transaction.objectStore(TARIFFS_STORE);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export { 
  initDB,
  saveToken, 
  getToken, 
  removeToken,
  saveTariff,
  getAllTariffs,
  updateTariff,
  deleteTariff,
  clearAllTariffs
};