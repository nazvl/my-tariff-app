import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTariffStore } from '@/store/tariff.js'

// Мокаем API функции
vi.mock('@/api/api.js', () => ({
  getTariffs: vi.fn()
}))

vi.mock('@/api/idb.js', () => ({
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn()
}))

describe('Tariff Store', () => {
  let tariffStore

  beforeEach(() => {
    setActivePinia(createPinia())
    tariffStore = useTariffStore()
    vi.clearAllMocks()
  })

  it('инициализируется с пустым массивом тарифов', () => {
    expect(tariffStore.tariffs).toEqual([])
  })

  it('загружает тарифы из IndexedDB', async () => {
    const { getItem } = await import('@/api/idb.js')
    const mockTariffs = [
      {
        id: '1',
        val: 'Тариф 1',
        qrs: ['QR1', 'QR2'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }
    ]
    
    getItem.mockResolvedValue(mockTariffs)
    
    const result = await tariffStore.loadFromIDB()
    
    expect(getItem).toHaveBeenCalledWith('tariffs')
    expect(result).toEqual(mockTariffs)
    expect(tariffStore.tariffs).toEqual(mockTariffs)
  })

  it('возвращает пустой массив если нет данных в IndexedDB', async () => {
    const { getItem } = await import('@/api/idb.js')
    
    getItem.mockResolvedValue(null)
    
    const result = await tariffStore.loadFromIDB()
    
    expect(result).toEqual([])
  })
  it('добавляет новый тариф', async () => {
    const { setItem } = await import('@/api/idb.js')
    const newTariff = {
      id: '1',
      val: 'Новый тариф',
      qrs: ['QR1'],
      created: '2023-01-01T00:00:00Z',
      processed: false
    }
    
    await tariffStore.addTariff(newTariff)
    
    expect(tariffStore.tariffs).toHaveLength(1)
    expect(tariffStore.tariffs[0]).toEqual(newTariff)
    expect(setItem).toHaveBeenCalledWith('tariffs', [newTariff])
  })
  it('получает тарифы из API', async () => {
    const { getTariffs } = await import('@/api/api.js')
    const { setItem } = await import('@/api/idb.js')
    
    const mockApiTariffs = [
      {
        id: '1',
        val: 'API Тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: true
      }
    ]
    
    getTariffs.mockResolvedValue(mockApiTariffs)
    
    const result = await tariffStore.fetchTariffs()
    
    expect(getTariffs).toHaveBeenCalled()
    expect(setItem).toHaveBeenCalledWith('tariffs', mockApiTariffs)
    expect(tariffStore.tariffs).toEqual(mockApiTariffs)
    expect(result).toEqual(mockApiTariffs)
  })

  it('обрабатывает ошибку API и загружает из IndexedDB', async () => {
    const { getTariffs } = await import('@/api/api.js')
    const { getItem } = await import('@/api/idb.js')
    
    const mockLocalTariffs = [
      {
        id: '1',
        val: 'Локальный тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }
    ]
    
    getTariffs.mockRejectedValue(new Error('Network error'))
    getItem.mockResolvedValue(mockLocalTariffs)
    
    const result = await tariffStore.fetchTariffs()
    
    expect(result).toEqual(mockLocalTariffs)
    expect(tariffStore.tariffs).toEqual(mockLocalTariffs)
  })
  it('объединяет API и локальные тарифы без дубликатов', async () => {
    const { getTariffs } = await import('@/api/api.js')
    const { setItem, getItem } = await import('@/api/idb.js')
    
    // Мокаем загрузку существующих тарифов
    const existingTariffs = [
      {
        id: '1',
        val: 'Локальный тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      },
      {
        id: '2',
        val: 'Дублированный тариф',
        qrs: ['QR2'],
        created: '2023-01-02T00:00:00Z',
        processed: false
      }
    ]

    const apiTariffs = [
      {
        id: '3',
        val: 'API Тариф',
        qrs: ['QR3'],
        created: '2023-01-03T00:00:00Z',
        processed: true
      },
      {
        id: '4',
        val: 'Дублированный тариф',
        qrs: ['QR2'],
        created: '2023-01-02T00:00:00Z',
        processed: true
      }
    ]
    
    // Мокаем getItem для loadFromIDB
    getItem.mockResolvedValue(existingTariffs)
    getTariffs.mockResolvedValue(apiTariffs)
    
    const result = await tariffStore.fetchTariffs()
    
    expect(result).toHaveLength(3) // 2 из API + 1 уникальный локальный
    expect(result).toEqual([
      ...apiTariffs,
      existingTariffs[0] // только первый локальный тариф, второй - дубликат
    ])
  })
})
