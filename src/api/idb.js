import { openDB } from 'idb';

const DB_NAME = 'tariff-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

async function getDB() {
  try {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error;
  }
}

export async function setItem(key, value) {
  try {
    const db = await getDB();
    return db.put(STORE_NAME, value, key);
  } catch (error) {
    console.error('Failed to set item:', error);
    throw error;
  }
}

export async function getItem(key) {
  try {
    const db = await getDB();
    return db.get(STORE_NAME, key);
  } catch (error) {
    console.error('Failed to get item:', error);
    return null;
  }
}

export async function removeItem(key) {
  try {
    const db = await getDB();
    return db.delete(STORE_NAME, key);
  } catch (error) {
    console.error('Failed to remove item:', error);
    throw error;
  }
}