import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { synchronizer } from '@/api/synchronizeWithServer.js'

// Мокаем store
vi.mock('@/store/tariff.js', () => ({
  useTariffStore: vi.fn()
}))

// Мокаем IndexedDB API
vi.mock('@/api/idb.js', () => ({
  setItem: vi.fn(),
  getItem: vi.fn()
}))

describe('Synchronizer', () => {
  let mockTariffStore
  beforeEach(async () => {
    setActivePinia(createPinia())
    
    // Создаем мок store
    mockTariffStore = {
      tariffs: []
    }
    
    const { useTariffStore } = await import('@/store/tariff.js')
    vi.mocked(useTariffStore).mockReturnValue(mockTariffStore)
    
    vi.clearAllMocks()
  })

  it('синхронизирует данные между store и IndexedDB', async () => {
    const { setItem, getItem } = await import('@/api/idb.js')
    
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
    
    mockTariffStore.tariffs = storeTariffs
    getItem.mockResolvedValue(idbTariffs)
    
    const result = await synchronizer()
    
    expect(result).toHaveLength(2)
    expect(result).toEqual([...storeTariffs, ...idbTariffs])
    expect(setItem).toHaveBeenCalledWith('tariffs', result)
    expect(mockTariffStore.tariffs).toEqual(result)
  })

  it('исключает дубликаты при синхронизации', async () => {
    const { setItem, getItem } = await import('@/api/idb.js')
    
    const duplicateTariff = {
      id: '1',
      val: 'Дубликат',
      qrs: ['QR1'],
      created: '2023-01-01T00:00:00Z',
      processed: false
    }
    
    const storeTariffs = [duplicateTariff]
    const idbTariffs = [duplicateTariff, {
      id: '2',
      val: 'Уникальный IDB тариф',
      qrs: ['QR2'],
      created: '2023-01-02T00:00:00Z',
      processed: false
    }]
    
    mockTariffStore.tariffs = storeTariffs
    getItem.mockResolvedValue(idbTariffs)
    
    const result = await synchronizer()
    
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(duplicateTariff)
    expect(result[1]).toEqual(idbTariffs[1])
  })

  it('работает с пустым store', async () => {
    const { setItem, getItem } = await import('@/api/idb.js')
    
    const idbTariffs = [
      {
        id: '1',
        val: 'Только IDB тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }
    ]
    
    mockTariffStore.tariffs = []
    getItem.mockResolvedValue(idbTariffs)
    
    const result = await synchronizer()
    
    expect(result).toEqual(idbTariffs)
    expect(mockTariffStore.tariffs).toEqual(idbTariffs)
  })

  it('работает с пустым IndexedDB', async () => {
    const { setItem, getItem } = await import('@/api/idb.js')
    
    const storeTariffs = [
      {
        id: '1',
        val: 'Только Store тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }
    ]
    
    mockTariffStore.tariffs = storeTariffs
    getItem.mockResolvedValue(null)
    
    const result = await synchronizer()
    
    expect(result).toEqual(storeTariffs)
    expect(mockTariffStore.tariffs).toEqual(storeTariffs)
  })

  it('обрабатывает ошибки синхронизации', async () => {
    const { getItem } = await import('@/api/idb.js')
    
    getItem.mockRejectedValue(new Error('IndexedDB error'))
    
    await expect(synchronizer()).rejects.toThrow('IndexedDB error')
  })

  it('правильно сериализует сложные объекты', async () => {
    const { setItem, getItem } = await import('@/api/idb.js')
    
    const complexTariff = {
      id: '1',
      val: 'Сложный тариф',
      qrs: ['QR1', 'QR2'],
      created: '2023-01-01T00:00:00Z',
      processed: false,
      metadata: {
        category: 'premium',
        features: ['feature1', 'feature2']
      }
    }
    
    mockTariffStore.tariffs = [complexTariff]
    getItem.mockResolvedValue([])
    
    const result = await synchronizer()
    
    // Проверяем, что результат был правильно сериализован
    const savedData = setItem.mock.calls[0][1]
    expect(JSON.stringify(savedData)).toBe(JSON.stringify(result))
  })

  // ТЕСТЫ ДЛЯ ОФФЛАЙН СИНХРОНИЗАЦИИ
  describe('Оффлайн синхронизация', () => {    it('синхронизирует данные в оффлайне без потери', async () => {
      const { setItem, getItem } = await import('@/api/idb.js')
      
      const offlineStoreTariffs = [
        {
          id: '1',
          val: 'Оффлайн создан в store',
          qrs: ['QR1'],
          created: '2023-01-01T00:00:00Z',
          processed: false
        }
      ]
      
      const offlineIdbTariffs = [
        {
          id: '2',
          val: 'Оффлайн создан в IDB',
          qrs: ['QR2'],
          created: '2023-01-02T00:00:00Z',
          processed: false
        }
      ]
      
      mockTariffStore.tariffs = offlineStoreTariffs
      getItem.mockResolvedValue(offlineIdbTariffs)
      
      const result = await synchronizer()
      
      expect(result).toHaveLength(2)
      // Проверяем что оба тарифа присутствуют
      expect(result.some(t => t.id === '1')).toBe(true)
      expect(result.some(t => t.id === '2')).toBe(true)
    })

    it('сохраняет порядок приоритета: сначала store, потом IDB', async () => {
      const { setItem, getItem } = await import('@/api/idb.js')
      
      const storeTariffs = [
        { id: '1', val: 'Store 1', qrs: ['QR1'], created: '2023-01-01T00:00:00Z', processed: false },
        { id: '2', val: 'Store 2', qrs: ['QR2'], created: '2023-01-02T00:00:00Z', processed: false }
      ]
      
      const idbTariffs = [
        { id: '3', val: 'IDB 1', qrs: ['QR3'], created: '2023-01-03T00:00:00Z', processed: false },
        { id: '4', val: 'IDB 2', qrs: ['QR4'], created: '2023-01-04T00:00:00Z', processed: false }
      ]
      
      mockTariffStore.tariffs = storeTariffs
      getItem.mockResolvedValue(idbTariffs)
      
      const result = await synchronizer()
      
      expect(result.slice(0, 2)).toEqual(storeTariffs)
      expect(result.slice(2, 4)).toEqual(idbTariffs)
    })

    it('обрабатывает большие объемы данных в оффлайне', async () => {
      const { setItem, getItem } = await import('@/api/idb.js')
      
      // Создаем большое количество тарифов
      const largeTariffsSet = Array.from({ length: 100 }, (_, i) => ({
        id: `store-${i}`,
        val: `Store тариф ${i}`,
        qrs: [`QR-store-${i}`],
        created: `2023-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        processed: false
      }))
      
      const largeIdbSet = Array.from({ length: 50 }, (_, i) => ({
        id: `idb-${i}`,
        val: `IDB тариф ${i}`,
        qrs: [`QR-idb-${i}`],
        created: `2023-02-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        processed: false
      }))
      
      mockTariffStore.tariffs = largeTariffsSet
      getItem.mockResolvedValue(largeIdbSet)
      
      const result = await synchronizer()
      
      expect(result).toHaveLength(150)
      expect(setItem).toHaveBeenCalledWith('tariffs', result)
    })
  })
})
