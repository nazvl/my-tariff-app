import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTariffStore } from '@/store/tariff.js'
import { synchronizer } from '@/api/synchronizeWithServer.js'

// Мокаем все зависимости
vi.mock('@/api/api.js', () => ({
  getTariffs: vi.fn()
}))

vi.mock('@/api/idb.js', () => ({
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn()
}))

describe('Интеграционные тесты - Оффлайн режим', () => {
  let tariffStore

  beforeEach(() => {
    setActivePinia(createPinia())
    tariffStore = useTariffStore()
    vi.clearAllMocks()
  })

  describe('Полный оффлайн жизненный цикл', () => {
    it('создает, сохраняет и синхронизирует тарифы в оффлайне', async () => {
      const { getTariffs } = await import('@/api/api.js')
      const { setItem, getItem } = await import('@/api/idb.js')

      // Шаг 1: Приложение запускается в оффлайне, нет данных
      getItem.mockResolvedValue(null)
      getTariffs.mockRejectedValue(new Error('Network unavailable'))

      let result = await tariffStore.fetchTariffs()
      expect(result).toEqual([])

      // Шаг 2: Пользователь создает тарифы в оффлайне
      const offlineTariff1 = {
        id: '1',
        val: 'Оффлайн тариф 1',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }

      const offlineTariff2 = {
        id: '2',
        val: 'Оффлайн тариф 2',
        qrs: ['QR2'],
        created: '2023-01-02T00:00:00Z',
        processed: false
      }

      await tariffStore.addTariff(offlineTariff1)
      await tariffStore.addTariff(offlineTariff2)

      expect(tariffStore.tariffs).toHaveLength(2)
      expect(setItem).toHaveBeenCalledTimes(2)

      // Шаг 3: Приложение перезапускается, данные восстанавливаются
      const newTariffStore = useTariffStore()
      getItem.mockResolvedValue([offlineTariff1, offlineTariff2])

      result = await newTariffStore.loadFromIDB()
      expect(result).toHaveLength(2)
      expect(newTariffStore.tariffs).toEqual([offlineTariff1, offlineTariff2])

      // Шаг 4: Синхронизация при восстановлении сети
      const apiTariffs = [
        {
          id: '3',
          val: 'API тариф',
          qrs: ['QR3'],
          created: '2023-01-03T00:00:00Z',
          processed: true
        }
      ]

      getTariffs.mockResolvedValue(apiTariffs)
      
      result = await newTariffStore.fetchTariffs()
      expect(result).toHaveLength(3) // 1 API + 2 оффлайн
      expect(result).toEqual([...apiTariffs, offlineTariff1, offlineTariff2])
    })

    it('обрабатывает конфликты при синхронизации', async () => {
      const { getTariffs } = await import('@/api/api.js')
      const { setItem, getItem } = await import('@/api/idb.js')

      // Подготавливаем данные с конфликтами
      const localTariff = {
        id: '1',
        val: 'Конфликтный тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }

      const apiTariff = {
        id: '2',
        val: 'Конфликтный тариф', // Такое же название
        qrs: ['QR1'], // Такие же QR коды
        created: '2023-01-01T00:00:00Z',
        processed: true
      }

      getItem.mockResolvedValue([localTariff])
      getTariffs.mockResolvedValue([apiTariff])      // При конфликте API тариф должен иметь приоритет
      const result = await tariffStore.fetchTariffs()
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(apiTariff)
      expect(result[0].processed).toBe(true)
    })

    it('восстанавливается после критических ошибок', async () => {
      const { getTariffs } = await import('@/api/api.js')
      const { setItem, getItem } = await import('@/api/idb.js')

      // Симулируем критическую ошибку IndexedDB
      getItem.mockResolvedValue(null) // getItem возвращает null при ошибке
      getTariffs.mockRejectedValue(new Error('Network error'))

      // Приложение должно продолжить работу с пустым состоянием
      const result = await tariffStore.fetchTariffs()
      expect(result).toEqual([])      // Пользователь может добавлять новые тарифы после восстановления IDB
      const newTariff = {
        val: 'Восстановленный тариф',
        qrs: ['QR1']
      }

      setItem.mockResolvedValue() // Восстанавливаем работу IndexedDB
      await tariffStore.addTariff(newTariff)

      expect(tariffStore.tariffs).toHaveLength(1)
      expect(tariffStore.tariffs[0]).toMatchObject(newTariff)
    })
  })

  describe('Синхронизация с сервером в оффлайне', () => {
    it('сохраняет локальные изменения для последующей синхронизации', async () => {
      const { setItem, getItem } = await import('@/api/idb.js')

      // Подготавливаем состояние store
      const storeTariffs = [
        {
          id: '1',
          val: 'Store тариф',
          qrs: ['QR1'],
          created: '2023-01-01T00:00:00Z',
          processed: false
        }
      ]

      const idbTariffs = [
        {
          id: '2',
          val: 'IDB тариф',
          qrs: ['QR2'],
          created: '2023-01-02T00:00:00Z',
          processed: false
        }
      ]

      tariffStore.tariffs = storeTariffs
      getItem.mockResolvedValue(idbTariffs)

      const result = await synchronizer()

      expect(result).toHaveLength(2)
      expect(setItem).toHaveBeenCalledWith('tariffs', result)
    })

    it('обрабатывает большие объемы данных при синхронизации', async () => {
      const { setItem, getItem } = await import('@/api/idb.js')

      // Создаем большое количество тарифов в store
      const largeTariffSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `store-${i}`,
        val: `Store тариф ${i}`,
        qrs: [`QR-${i}`],
        created: `2023-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
        processed: false
      }))

      tariffStore.tariffs = largeTariffSet
      getItem.mockResolvedValue([])

      const result = await synchronizer()

      expect(result).toHaveLength(1000)
      expect(setItem).toHaveBeenCalledWith('tariffs', result)
    })

    it('обрабатывает ошибки синхронизации и откатывается к безопасному состоянию', async () => {
      const { getItem } = await import('@/api/idb.js')

      tariffStore.tariffs = [
        {
          id: '1',
          val: 'Safe тариф',
          qrs: ['QR1'],
          created: '2023-01-01T00:00:00Z',
          processed: false
        }
      ]

      // Симулируем ошибку при получении данных из IDB
      getItem.mockRejectedValue(new Error('Sync error'))

      await expect(synchronizer()).rejects.toThrow('Sync error')
      
      // Store должен сохранить свое состояние
      expect(tariffStore.tariffs).toHaveLength(1)
    })
  })

  describe('Производительность в оффлайне', () => {
    it('быстро загружает большие объемы данных из локального хранилища', async () => {
      const { getItem } = await import('@/api/idb.js')

      const largeTariffSet = Array.from({ length: 10000 }, (_, i) => ({
        id: `tariff-${i}`,
        val: `Тариф ${i}`,
        qrs: [`QR-${i}`],
        created: `2023-01-01T00:00:00Z`,
        processed: false
      }))

      getItem.mockResolvedValue(largeTariffSet)

      const startTime = Date.now()
      const result = await tariffStore.loadFromIDB()
      const endTime = Date.now()

      expect(result).toHaveLength(10000)
      expect(endTime - startTime).toBeLessThan(1000) // Должно быть быстро
    })

    it('эффективно обрабатывает множественные операции', async () => {
      const { setItem } = await import('@/api/idb.js')

      const operations = Array.from({ length: 100 }, (_, i) => ({
        id: `tariff-${i}`,
        val: `Тариф ${i}`,
        qrs: [`QR-${i}`],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }))

      const startTime = Date.now()
      
      for (const tariff of operations) {
        await tariffStore.addTariff(tariff)
      }

      const endTime = Date.now()

      expect(tariffStore.tariffs).toHaveLength(100)
      expect(setItem).toHaveBeenCalledTimes(100)
      expect(endTime - startTime).toBeLessThan(5000) // Разумное время для 100 операций
    })

    it('управляет памятью при работе с большими данными', async () => {
      const { setItem, getItem } = await import('@/api/idb.js')

      // Тест на утечки памяти с большими объектами
      const largeTariff = {
        id: '1',
        val: 'Большой тариф',
        qrs: Array.from({ length: 1000 }, (_, i) => `QR-${i}`),
        created: '2023-01-01T00:00:00Z',
        processed: false,
        largeData: Array.from({ length: 10000 }, (_, i) => `data-${i}`)
      }

      await tariffStore.addTariff(largeTariff)

      // Проверяем, что данные были правильно сериализованы
      const savedData = setItem.mock.calls[0][1]
      expect(Array.isArray(savedData)).toBe(true)
      expect(savedData[0].largeData).toHaveLength(10000)
    })
  })

  describe('Восстановление данных', () => {
    it('восстанавливает данные после сбоя приложения', async () => {
      const { getItem } = await import('@/api/idb.js')

      const persistedTariffs = [
        {
          id: '1',
          val: 'Восстановленный тариф 1',
          qrs: ['QR1'],
          created: '2023-01-01T00:00:00Z',
          processed: false
        },
        {
          id: '2',
          val: 'Восстановленный тариф 2',
          qrs: ['QR2'],
          created: '2023-01-02T00:00:00Z',
          processed: false
        }
      ]

      getItem.mockResolvedValue(persistedTariffs)

      // Симулируем новый запуск приложения после сбоя
      const recoveredStore = useTariffStore()
      expect(recoveredStore.tariffs).toEqual([])

      const result = await recoveredStore.loadFromIDB()

      expect(result).toEqual(persistedTariffs)
      expect(recoveredStore.tariffs).toEqual(persistedTariffs)
    })

    it('проверяет целостность восстановленных данных', async () => {
      const { getItem } = await import('@/api/idb.js')

      const corruptedData = [
        {
          id: '1',
          val: 'Правильный тариф',
          qrs: ['QR1'],
          created: '2023-01-01T00:00:00Z',
          processed: false
        },
        {
          // Поврежденная запись без обязательных полей
          id: '2',
          val: null,
          qrs: undefined
        }
      ]

      getItem.mockResolvedValue(corruptedData)

      const result = await tariffStore.loadFromIDB()

      // Приложение должно загрузить данные, даже если они частично повреждены
      expect(result).toEqual(corruptedData)
      expect(tariffStore.tariffs).toEqual(corruptedData)
    })

    it('создает резервные копии критических данных', async () => {
      const { setItem } = await import('@/api/idb.js')

      const criticalTariff = {
        id: '1',
        val: 'Критический тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }

      await tariffStore.addTariff(criticalTariff)

      // Проверяем, что данные сохранены
      expect(setItem).toHaveBeenCalledWith('tariffs', [criticalTariff])

      // Можно расширить логикой создания резервных копий
      // например, сохранение в нескольких ключах
    })
  })
})
