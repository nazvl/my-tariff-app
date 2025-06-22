<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useAuthStore } from '@/store/auth.js'
import { useTariffStore } from '@/store/tariff.js'

const router = useRouter()
const authStore = useAuthStore()
const tariffStore = useTariffStore()

const selectedTariff = ref('T1')
const scannedQR = ref('')
const isScanning = ref(false)

const tariffOptions = ['T1', 'T2', 'T3']

onMounted(async () => {
  const isAuthenticated = await authStore.checkToken()
  if (!isAuthenticated) {
    router.push('/login')
  }
})

function startScanning() {
  isScanning.value = true
}

function onDetect(detectedCodes) {
  if (detectedCodes.length > 0) {
    scannedQR.value = detectedCodes[0].rawValue
    isScanning.value = false
  }
}

function onError(error) {
  console.error('Ошибка сканирования:', error)
  isScanning.value = false
}

async function applyTariff() {
  if (!scannedQR.value) return

  const newTariff = {
    val: selectedTariff.value,
    qrs: [scannedQR.value],
    processed: false,
    created: new Date().toISOString()
  }

  await tariffStore.addTariff(newTariff)
  router.push('/tariffs')
}
</script>

<template>
  <div class="container">
    <h1>Установка тарифа</h1>
    
    <!-- Селектор тарифа -->
    <div class="tariff-selector">
      <label>Выберите тариф:</label>
      <select v-model="selectedTariff">
        <option v-for="tariff in tariffOptions" :key="tariff" :value="tariff">
          {{ tariff }}
        </option>
      </select>
    </div>

    <!-- QR сканер -->
    <div class="qr-section">
      <div v-if="!isScanning">
        <button @click="startScanning">Начать сканирование QR</button>
        <div v-if="scannedQR">
          QR: {{ scannedQR }}
        </div>
      </div>

      <div v-if="isScanning">
        <QrcodeStream @detect="onDetect" @error="onError" />
      </div>
    </div>

    <!-- Кнопка применения тарифа -->
    <button @click="applyTariff" :disabled="!scannedQR">
      Применить тариф
    </button>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.tariff-selector {
  margin: 20px 0;
}

.tariff-selector label {
  display: block;
  margin-bottom: 10px;
}

.tariff-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-section {
  margin: 20px 0;
  text-align: center;
}

button {
  padding: 12px 24px;
  margin: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>