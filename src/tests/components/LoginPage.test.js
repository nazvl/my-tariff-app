import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import { useAuthStore } from '@/store/auth.js'

describe('LoginPage', () => {
  let wrapper
  let router
  let authStore

  beforeEach(async () => {
    setActivePinia(createPinia())
    
    // Создаем роутер для тестов
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', component: LoginPage },
        { path: '/tariffs', component: { template: '<div>Tariffs</div>' } }
      ]
    })

    authStore = useAuthStore()
    
    // Мокаем методы store
    authStore.checkToken = vi.fn().mockResolvedValue(false)
    authStore.login = vi.fn()

    wrapper = mount(LoginPage, {
      global: {
        plugins: [router]
      }
    })

    await router.isReady()
  })

  it('рендерится корректно', () => {
    expect(wrapper.find('.login-container').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Авторизация')
  })

  it('содержит поля для ввода логина и пароля', () => {
    const usernameInput = wrapper.find('input[placeholder="Логин"]')
    const passwordInput = wrapper.find('input[placeholder="Пароль"]')
    
    expect(usernameInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('содержит кнопку входа', () => {
    const loginButton = wrapper.find('button')
    expect(loginButton.exists()).toBe(true)
    expect(loginButton.text()).toBe('Войти')
  })

  it('показывает ошибку при пустых полях', async () => {
    const loginButton = wrapper.find('button')
    
    await loginButton.trigger('click')
    
    const errorDiv = wrapper.find('.error')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Необходимо заполнить все поля')
    expect(errorDiv.attributes('style')).toContain('background-color: yellow')
  })

  it('показывает ошибку при полях с пробелами', async () => {
    const usernameInput = wrapper.find('input[placeholder="Логин"]')
    const passwordInput = wrapper.find('input[placeholder="Пароль"]')
    const loginButton = wrapper.find('button')
    
    await usernameInput.setValue('   ')
    await passwordInput.setValue('   ')
    await loginButton.trigger('click')
    
    const errorDiv = wrapper.find('.error')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe('Необходимо заполнить все поля')
  })

  it('выполняет успешный логин', async () => {
    const usernameInput = wrapper.find('input[placeholder="Логин"]')
    const passwordInput = wrapper.find('input[placeholder="Пароль"]')
    const loginButton = wrapper.find('button')
    
    const routerPushSpy = vi.spyOn(router, 'push')
    authStore.login.mockResolvedValue({ success: true })
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('password123')
    await loginButton.trigger('click')
    
    expect(authStore.login).toHaveBeenCalledWith('testuser', 'password123')
    expect(routerPushSpy).toHaveBeenCalledWith('/tariffs')
  })

  it('показывает ошибку при неудачном логине', async () => {
    const usernameInput = wrapper.find('input[placeholder="Логин"]')
    const passwordInput = wrapper.find('input[placeholder="Пароль"]')
    const loginButton = wrapper.find('button')
    
    const errorMessage = 'Неверные учетные данные'
    authStore.login.mockRejectedValue({ error: errorMessage })
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('wrongpassword')
    await loginButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    const errorDiv = wrapper.find('.error')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toBe(errorMessage)
    expect(errorDiv.attributes('style')).toContain('background-color: red')
  })

  it('перенаправляет на страницу тарифов если пользователь уже авторизован', async () => {
    // Размонтируем текущий компонент
    wrapper.unmount()
    
    // Мокаем проверку токена как успешную
    authStore.checkToken.mockResolvedValue(true)
    const routerPushSpy = vi.spyOn(router, 'push')
    
    // Монтируем компонент заново
    wrapper = mount(LoginPage, {
      global: {
        plugins: [router]
      }
    })
    
    await wrapper.vm.$nextTick()
    
    expect(authStore.checkToken).toHaveBeenCalled()
    expect(routerPushSpy).toHaveBeenCalledWith('/tariffs')
  })

  it('очищает ошибку при новой попытке входа', async () => {
    const usernameInput = wrapper.find('input[placeholder="Логин"]')
    const passwordInput = wrapper.find('input[placeholder="Пароль"]')
    const loginButton = wrapper.find('button')
    
    // Сначала показываем ошибку
    await loginButton.trigger('click')
    expect(wrapper.find('.error').exists()).toBe(true)
    
    // Затем вводим данные и пытаемся войти снова
    authStore.login.mockResolvedValue({ success: true })
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('password123')
    await loginButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    // Ошибка должна исчезнуть
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('корректно обновляет реактивные данные при вводе', async () => {
    const usernameInput = wrapper.find('input[placeholder="Логин"]')
    const passwordInput = wrapper.find('input[placeholder="Пароль"]')
    
    await usernameInput.setValue('testuser')
    await passwordInput.setValue('testpass')
    
    expect(usernameInput.element.value).toBe('testuser')
    expect(passwordInput.element.value).toBe('testpass')
  })
})
