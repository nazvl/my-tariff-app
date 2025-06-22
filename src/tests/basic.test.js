import { describe, it, expect } from 'vitest'

describe('Базовые тесты', () => {
  it('математика работает', () => {
    expect(2 + 2).toBe(4)
  })

  it('строки объединяются', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World')
  })

  it('массивы работают корректно', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr[0]).toBe(1)
  })

  it('объекты работают корректно', () => {
    const obj = { name: 'test', value: 123 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(123)
  })
})
