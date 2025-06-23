import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setItem, getItem, removeItem } from '@/api/idb.js'

// Мокаем idb библиотеку
vi.mock('idb', () => ({
  openDB: vi.fn()
}))

describe('IndexedDB API', () => {
  let mockDB
  beforeEach(async () => {
    mockDB = {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      createObjectStore: vi.fn(),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(false)
      }
    }

    const { openDB } = await import('idb')
    vi.mocked(openDB).mockResolvedValue(mockDB)
    
    vi.clearAllMocks()
  })

  describe('setItem', () => {
    it('успешно сохраняет данные', async () => {
      const testData = [{ id: '1', val: 'Test' }]
      
      await setItem('tariffs', testData)
      
      expect(mockDB.put).toHaveBeenCalledWith('keyval', testData, 'tariffs')
    })

    it('обрабатывает ошибки сохранения', async () => {
      const error = new Error('Save failed')
      mockDB.put.mockRejectedValue(error)
      
      await expect(setItem('tariffs', [])).rejects.toThrow('Save failed')
    })
  })
  describe('getItem', () => {
    it('успешно загружает данные', async () => {
      const testData = [{ id: '1', val: 'Test' }]
      mockDB.get.mockResolvedValue(testData)
      
      const result = await getItem('tariffs')      
      expect(mockDB.get).toHaveBeenCalledWith('keyval', 'tariffs')
      expect(result).toEqual(testData)
    })

    it('возвращает null при ошибке загрузки', async () => {
      const { openDB } = await import('idb')
      const error = new Error('Load failed')
      openDB.mockRejectedValue(error)
      
      // Функция getItem должна вернуть null при ошибке, а не выбросить ошибку
      const result = await getItem('tariffs')
      
      expect(result).toBeNull()
    })

    it('возвращает undefined для несуществующего ключа', async () => {
      mockDB.get.mockResolvedValue(undefined)
      
      const result = await getItem('nonexistent')
      
      expect(result).toBeUndefined()
    })
  })

  describe('removeItem', () => {
    it('успешно удаляет данные', async () => {
      await removeItem('tariffs')
      
      expect(mockDB.delete).toHaveBeenCalledWith('keyval', 'tariffs')
    })

    it('обрабатывает ошибки удаления', async () => {
      const error = new Error('Delete failed')
      mockDB.delete.mockRejectedValue(error)
      
      await expect(removeItem('tariffs')).rejects.toThrow('Delete failed')
    })
  })

  // ТЕСТЫ ДЛЯ ОФФЛАЙН РАБОТЫ IndexedDB
  describe('Оффлайн сценарии IndexedDB', () => {
    it('создает базу данных при первом запуске', async () => {
      const { openDB } = await import('idb')
      
      mockDB.objectStoreNames.contains.mockReturnValue(false)
      
      await setItem('tariffs', [])
      
      expect(openDB).toHaveBeenCalledWith('tariff-app-db', 1, expect.any(Object))
    })

    it('обрабатывает сбой подключения к IndexedDB', async () => {
      const { openDB } = await import('idb')
      openDB.mockRejectedValue(new Error('IndexedDB not available'))
      
      await expect(setItem('tariffs', [])).rejects.toThrow('IndexedDB not available')
    })

    it('сохраняет сложные объекты в оффлайне', async () => {
      const complexData = [
        {
          id: '1',
          val: 'Сложный тариф',
          qrs: ['QR1', 'QR2', 'QR3'],
          created: '2023-01-01T00:00:00Z',
          processed: false,
          metadata: {
            category: 'premium',
            features: ['feature1', 'feature2'],
            pricing: {
              base: 100,
              discounts: [10, 20]
            }
          }
        }
      ]
      
      await setItem('tariffs', complexData)
      
      expect(mockDB.put).toHaveBeenCalledWith('keyval', complexData, 'tariffs')
    })

    it('обрабатывает множественные операции в оффлайне', async () => {
      const data1 = [{ id: '1', val: 'Data 1' }]
      const data2 = [{ id: '2', val: 'Data 2' }]
      
      await Promise.all([
        setItem('tariffs', data1),
        setItem('backup', data2)
      ])
      
      expect(mockDB.put).toHaveBeenCalledTimes(2)
      expect(mockDB.put).toHaveBeenCalledWith('keyval', data1, 'tariffs')
      expect(mockDB.put).toHaveBeenCalledWith('keyval', data2, 'backup')
    })

    it('восстанавливает данные после перезапуска приложения', async () => {
      const persistedData = [
        { id: '1', val: 'Persisted tariff', qrs: ['QR1'], processed: false }
      ]
      
      mockDB.get.mockResolvedValue(persistedData)
      
      const result = await getItem('tariffs')
      
      expect(result).toEqual(persistedData)
    })

    it('очищает данные при необходимости', async () => {
      await removeItem('tariffs')
      await removeItem('backup')
      
      expect(mockDB.delete).toHaveBeenCalledTimes(2)
      expect(mockDB.delete).toHaveBeenCalledWith('keyval', 'tariffs')
      expect(mockDB.delete).toHaveBeenCalledWith('keyval', 'backup')
    })

    it('обрабатывает случай переполнения хранилища', async () => {
      const quotaError = new Error('QuotaExceededError')
      mockDB.put.mockRejectedValue(quotaError)
      
      await expect(setItem('tariffs', [])).rejects.toThrow('QuotaExceededError')
    })

    it('обрабатывает версионные конфликты базы данных', async () => {
      const { openDB } = await import('idb')
      const versionError = new Error('VersionError')
      
      // Переопределяем мок для конкретного вызова
      vi.mocked(openDB).mockRejectedValue(versionError)
      
      // getItem должен вернуть null при ошибке открытия базы
      const result = await getItem('tariffs')
      expect(result).toBeNull()
    })
  })

  describe('Миграции и обновления схемы', () => {
    it('создает object store при обновлении', async () => {
      const { openDB } = await import('idb')
      
      let upgradeCallback
      openDB.mockImplementation((dbName, version, options) => {
        upgradeCallback = options.upgrade
        return Promise.resolve(mockDB)
      })
      
      await setItem('tariffs', [])
      
      // Симулируем upgrade
      if (upgradeCallback) {
        upgradeCallback(mockDB)
      }
      
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('keyval')
    })

    it('не создает object store если уже существует', async () => {
      const { openDB } = await import('idb')
      
      mockDB.objectStoreNames.contains.mockReturnValue(true)
      
      let upgradeCallback
      openDB.mockImplementation((dbName, version, options) => {
        upgradeCallback = options.upgrade
        return Promise.resolve(mockDB)
      })
      
      await setItem('tariffs', [])
      
      if (upgradeCallback) {
        upgradeCallback(mockDB)
      }
      
      expect(mockDB.createObjectStore).not.toHaveBeenCalled()
    })
  })
})
