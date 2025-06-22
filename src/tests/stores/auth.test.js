import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/store/auth.js'

// Мокаем API функции
vi.mock('@/api/api.js', () => ({
  login: vi.fn()
}))

vi.mock('@/api/idb.js', () => ({
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn()
}))

describe('Auth Store', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  it('инициализируется с пустым состоянием', () => {
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
  })

  it('устанавливает данные аутентификации', () => {
    const user = 'testuser'
    const token = 'fake-token-123456'

    authStore.setAuth(user, token)

    expect(authStore.user).toBe(user)
    expect(authStore.token).toBe(token)
  })

  it('проверяет валидность токена', () => {
    expect(authStore.isValidToken('fake-token-123456')).toBe(true)
    expect(authStore.isValidToken('token-987654321')).toBe(true)
    expect(authStore.isValidToken('invalid-token')).toBe(false)
  })

  it('проверяет токен из store', async () => {
    authStore.token = 'fake-token-123456'
    
    const result = await authStore.checkToken()
    
    expect(result).toBe(true)
  })

  it('очищает данные при логауте', async () => {
    const { removeItem } = await import('@/api/idb.js')
    
    authStore.user = 'testuser'
    authStore.token = 'fake-token-123456'
    
    await authStore.logout()
    
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(removeItem).toHaveBeenCalledWith('username')
    expect(removeItem).toHaveBeenCalledWith('token')
  })

  it('выполняет успешный логин', async () => {
    const { login } = await import('@/api/api.js')
    const { setItem } = await import('@/api/idb.js')
    
    const mockResponse = {
      user: { login: 'testuser' },
      token: 'fake-token-123456'
    }
    
    login.mockResolvedValue(mockResponse)
    
    const result = await authStore.login('testuser', 'password')
    
    expect(login).toHaveBeenCalledWith('testuser', 'password')
    expect(authStore.user).toBe('testuser')
    expect(authStore.token).toBe('fake-token-123456')
    expect(setItem).toHaveBeenCalledWith('username', 'testuser')
    expect(setItem).toHaveBeenCalledWith('token', 'fake-token-123456')
    expect(result).toEqual(mockResponse)
  })

  it('обрабатывает ошибку логина', async () => {
    const { login } = await import('@/api/api.js')
    
    const error = new Error('Неверные учетные данные')
    login.mockRejectedValue(error)
    
    await expect(authStore.login('testuser', 'wrongpassword')).rejects.toThrow('Неверные учетные данные')
  })

  it('проверяет сохраненный токен при checkToken', async () => {
    const { getItem } = await import('@/api/idb.js')
    
    getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('fake-token-123456')
      if (key === 'username') return Promise.resolve('testuser')
      return Promise.resolve(null)
    })
    
    const result = await authStore.checkToken()
    
    expect(result).toBe(true)
    expect(authStore.user).toBe('testuser')
    expect(authStore.token).toBe('fake-token-123456')
  })

  it('удаляет невалидный сохраненный токен', async () => {
    const { getItem } = await import('@/api/idb.js')
    
    getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve('invalid-token')
      if (key === 'username') return Promise.resolve('testuser')
      return Promise.resolve(null)
    })
    
    const result = await authStore.checkToken()
    
    expect(result).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
  })
})
