import { defineStore } from 'pinia'

export const useTariffStore = defineStore('tariff', {
    state: () => ({
        tariffs: [],
        selectedTariff: null,
        loading: false,
        error: null
    }),

    getters: {
        getTariffById: (state) => (id) => {
            return state.tariffs.find(tariff => tariff.id === id)
        },
        
        activeTariffs: (state) => {
            return state.tariffs.filter(tariff => tariff.active)
        }
    },

    actions: {
        async fetchTariffs() {
            this.loading = true
            this.error = null
            
            try {
                // Replace with your API call
                const response = await fetch('/api/tariffs')
                const data = await response.json()
                this.tariffs = data
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        selectTariff(tariff) {
            this.selectedTariff = tariff
        },

        clearSelection() {
            this.selectedTariff = null
        }
    }
})