import { describe, it, expect, vi } from 'vitest'
import { login, getTariffs } from '@/api/api.js'

// Мокаем mockData.json
vi.mock('@/api/mockData.json', () => ({
  default: {
    users: [
      {
        login: 'testuser',
        password: 'password123',
        token: 'fake-token-123456'
      },
      {
        login: 'admin',
        password: 'admin123',
        token: 'token-987654321'
      }
    ],
    tariffs: [
      {
        id: '1',
        val: 'Тестовый тариф 1',
        qrs: ['QR1', 'QR2'],
        created: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        val: 'Тестовый тариф 2',
        qrs: ['QR3'],
        created: '2023-01-02T00:00:00Z'
      }
    ]
  }
}))

describe('API функции', () => {
  describe('login', () => {
    it('успешно авторизует пользователя с правильными данными', async () => {
      const result = await login('testuser', 'password123')
      
      expect(result).toEqual({
        success: true,
        user: {
          login: 'testuser'
        },
        token: 'fake-token-123456'
      })
    })

    it('отклоняет запрос с неверным паролем', async () => {
      await expect(login('testuser', 'wrongpassword')).rejects.toEqual({
        error: 'Неверный пароль'
      })
    })

    it('отклоняет запрос с несуществующим пользователем', async () => {
      await expect(login('nonexistent', 'password123')).rejects.toEqual({
        error: 'Пользователь не найден'
      })
    })

    it('работает с задержкой (имитация сетевого запроса)', async () => {
      const startTime = Date.now()
      await login('testuser', 'password123')
      const endTime = Date.now()
      
      // Проверяем, что функция действительно ждет (должно быть больше 1000ms)
      expect(endTime - startTime).toBeGreaterThan(1000)
    })
  })

  describe('getTariffs', () => {
    it('успешно возвращает список тарифов', async () => {
      const result = await getTariffs()
      
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      
      // Проверяем, что все тарифы имеют статус processed: true
      result.forEach(tariff => {
        expect(tariff.processed).toBe(true)
      })
      
      // Проверяем структуру первого тарифа
      expect(result[0]).toEqual({
        id: '1',
        val: 'Тестовый тариф 1',
        qrs: ['QR1', 'QR2'],
        created: '2023-01-01T00:00:00Z',
        processed: true
      })
    })

    it('работает с задержкой (имитация сетевого запроса)', async () => {
      const startTime = Date.now()
      await getTariffs()
      const endTime = Date.now()
      
      // Проверяем, что функция действительно ждет (должно быть больше 1900ms)
      expect(endTime - startTime).toBeGreaterThan(1900)
    })

    it('обрабатывает все тарифы и устанавливает processed: true', async () => {
      const result = await getTariffs()
      
      // Проверяем, что все тарифы помечены как обработанные
      const allProcessed = result.every(tariff => tariff.processed === true)
      expect(allProcessed).toBe(true)
    })
  })
})
