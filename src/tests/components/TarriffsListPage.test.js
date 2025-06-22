import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import TarriffsListPage from '@/pages/TarriffsListPage.vue'
import { useAuthStore } from '@/store/auth.js'
import { useTariffStore } from '@/store/tariff.js'

// Мокаем синхронизатор
vi.mock('@/api/synchronizeWithServer', () => ({
  synchronizer: vi.fn()
}))

describe('TarriffsListPage', () => {
  let wrapper
  let router
  let authStore
  let tariffStore

  beforeEach(async () => {
    setActivePinia(createPinia())
    
    // Создаем роутер для тестов
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/apply', component: { template: '<div>Apply</div>' } },
        { path: '/tariffs', component: TarriffsListPage }
      ]
    })

    authStore = useAuthStore()
    tariffStore = useTariffStore()

    // Мокаем методы store
    authStore.logout = vi.fn()
    tariffStore.fetchTariffs = vi.fn()

    wrapper = mount(TarriffsListPage, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true
        }
      }
    })

    await router.isReady()
  })

  it('рендерится корректно', () => {
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.find('.title').text()).toBe('Список тарифов')
  })

  it('отображает кнопки в заголовке', () => {
    expect(wrapper.find('.logout-btn').exists()).toBe(true)
    expect(wrapper.find('.add-btn').exists()).toBe(true)
    expect(wrapper.find('.logout-btn').text()).toBe('ВЫХОД')
    expect(wrapper.find('.add-btn').text()).toBe('Добавить тариф')
  })

  it('отображает сообщение о загрузке когда нет тарифов', () => {
    tariffStore.tariffs = []
    
    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toBe('Загрузка тарифов...')
  })

  it('отображает список тарифов', async () => {
    const mockTariffs = [
      {
        id: '1',
        val: 'Тариф 1',
        qrs: ['QR1', 'QR2'],
        created: '2023-01-01T12:00:00Z',
        processed: false
      },
      {
        id: '2',
        val: 'Тариф 2',
        qrs: ['QR3'],
        created: '2023-01-02T12:00:00Z',
        processed: true
      }
    ]

    tariffStore.tariffs = mockTariffs
    await wrapper.vm.$nextTick()

    const tariffCards = wrapper.findAll('.tariff-card')
    expect(tariffCards).toHaveLength(2)

    // Проверяем первый тариф
    const firstCard = tariffCards[0]
    expect(firstCard.find('.tariff-val').text()).toBe('Тариф 1')
    expect(firstCard.find('.tariff-qrs').text()).toBe('QRs: QR1, QR2')
    expect(firstCard.find('.tariff-created').text()).toBe('Создан: 2023-01-01')
    expect(firstCard.findAll('.tariff-created')[1].text()).toBe('Обработан: Нет')

    // Проверяем второй тариф
    const secondCard = tariffCards[1]
    expect(secondCard.find('.tariff-val').text()).toBe('Тариф 2')
    expect(secondCard.find('.tariff-qrs').text()).toBe('QRs: QR3')
    expect(secondCard.findAll('.tariff-created')[1].text()).toBe('Обработан: Да')
  })

  it('вызывает logout при клике на кнопку выхода', async () => {
    const logoutBtn = wrapper.find('.logout-btn')
    
    await logoutBtn.trigger('click')
    
    expect(authStore.logout).toHaveBeenCalled()
  })

  it('перенаправляет на страницу добавления тарифа', async () => {
    const addBtn = wrapper.find('.add-btn')
    const routerPushSpy = vi.spyOn(router, 'push')
    
    await addBtn.trigger('click')
    
    expect(routerPushSpy).toHaveBeenCalledWith('/apply')
  })
  it('загружает тарифы при монтировании', () => {
    expect(tariffStore.fetchTariffs).toHaveBeenCalled()
  })

  it('имеет адаптивную верстку для мобильных устройств', async () => {
    // Добавляем тарифы, чтобы элементы появились
    const mockTariffs = [
      {
        id: '1',
        val: 'Тест тариф',
        qrs: ['QR1'],
        created: '2023-01-01T00:00:00Z',
        processed: false
      }
    ]

    tariffStore.tariffs = mockTariffs
    await wrapper.vm.$nextTick()
    
    // Проверяем наличие CSS классов для мобильной адаптации
    expect(wrapper.find('.container').exists()).toBe(true)
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.tariffs-grid').exists()).toBe(true)
  })

  it('отображает корректный формат даты', async () => {
    const mockTariffs = [
      {
        id: '1',
        val: 'Тест тариф',
        qrs: ['QR1'],
        created: '2023-12-25T15:30:45Z',
        processed: false
      }
    ]

    tariffStore.tariffs = mockTariffs
    await wrapper.vm.$nextTick()

    const dateElement = wrapper.find('.tariff-created')
    expect(dateElement.text()).toBe('Создан: 2023-12-25')
  })
})
