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

  // Convert to plain object to avoid proxy issues
  const plainTariff = JSON.parse(JSON.stringify(newTariff))
  await tariffStore.addTariff(plainTariff)
  router.push('/tariffs')
}

function goBack() {
  router.push('/tariffs')
}

</script>

<template>
  <div class="container">
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Назад
      </button>
      <h1 class="title">Установка тарифа</h1>
    </div>
    
    <div class="content">
      <div class="card tariff-selector-card">
        <div class="card-header">
          <h2>Выбор тарифа</h2>
        </div>
        <div class="card-body">
          <label class="select-label">Выберите тариф:</label>
          <select v-model="selectedTariff" class="tariff-select">
            <option v-for="tariff in tariffOptions" :key="tariff" :value="tariff">
              Тариф {{ tariff }}
            </option>
          </select>
        </div>
      </div>

      <div class="card qr-section-card">
        <div class="card-header">
          <h2>Сканирование QR-кода</h2>
        </div>
        <div class="card-body">
          <div v-if="!isScanning" class="qr-controls">
            <div v-if="!scannedQR" class="qr-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="5" height="5"/>
                <rect x="3" y="16" width="5" height="5"/>
                <rect x="16" y="3" width="5" height="5"/>
                <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                <path d="M21 21v.01"/>
                <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                <path d="M3 12h.01"/>
                <path d="M12 3h.01"/>
                <path d="M12 16v.01"/>
                <path d="M16 12h1"/>
                <path d="M21 12v.01"/>
                <path d="M12 21v-1"/>
              </svg>
              <p>Нажмите кнопку для начала сканирования QR-кода</p>
            </div>
            
            <div v-if="scannedQR" class="qr-result">
              <div class="qr-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <h3>QR-код успешно отсканирован!</h3>
              <div class="qr-value">{{ scannedQR }}</div>
              <button @click="scannedQR = ''; isScanning = false" class="rescan-btn">
                Сканировать заново
              </button>
            </div>
            
            <button v-if="!scannedQR" @click="isScanning = true" class="scan-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Начать сканирование
            </button>
          </div>

          <div v-if="isScanning" class="scanner-container">
            <div class="scanner-wrapper">
              <QrcodeStream @detect="onDetect" @error="onError" />
              <div class="scanner-overlay">
                <div class="scanner-frame"></div>
              </div>
            </div>
            <button @click="isScanning = false" class="cancel-scan-btn">
              Отменить сканирование
            </button>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button @click="applyTariff" :disabled="!scannedQR" class="apply-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          Применить тариф
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0;
  min-height: 100dvh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
  border: 1px solid #e8f5e8;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(129, 199, 132, 0.3);
}

.title {
  color: #2e7d32;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.08);
  border: 1px solid #e8f5e8;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%);
  padding: 20px 24px;
  border-bottom: 1px solid #e8f5e8;
}

.card-header h2 {
  color: #2e7d32;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 24px;
}

.select-label {
  display: block;
  margin-bottom: 12px;
  color: #2e7d32;
  font-weight: 500;
  font-size: 16px;
}

.tariff-select {
  width: 100%;
  padding: 16px;
  border: 2px solid #a5d6a7;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  color: #2e7d32;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.tariff-select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
}

.selected-tariff {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  padding: 12px 16px;
  border-radius: 8px;
  color: #2e7d32;
  font-size: 14px;
  border: 1px solid #c8e6c9;
}

.qr-controls {
  text-align: center;
}

.qr-placeholder {
  padding: 40px 20px;
  color: #81c784;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.qr-placeholder svg {
  color: #a5d6a7;
}

.qr-placeholder p {
  margin: 0;
  font-size: 16px;
}

.qr-result {
  padding: 20px;
  text-align: center;
}

.qr-success {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.qr-result h3 {
  color: #2e7d32;
  margin: 0 0 16px;
  font-size: 20px;
}

.qr-value {
  background: #f1f8e9;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  color: #2e7d32;
  word-break: break-all;
  margin-bottom: 20px;
  border: 1px solid #c8e6c9;
}

.scan-btn, .rescan-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  margin: 20px auto 0;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.scan-btn:hover, .rescan-btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
}

.rescan-btn {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
}

.scanner-container {
  text-align: center;
}

.scanner-wrapper {
  position: relative;
  max-width: 400px;
  margin: 0 auto 20px;
  border-radius: 12px;
  overflow: hidden;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 200px;
  height: 200px;
  border: 3px solid #4caf50;
  border-radius: 12px;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
}

.cancel-scan-btn {
  padding: 12px 24px;
  border: 2px solid #ff7043;
  border-radius: 8px;
  background: white;
  color: #ff7043;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-scan-btn:hover {
  background: #ff7043;
  color: white;
  transform: translateY(-1px);
}

.action-section {
  text-align: center;
  padding-top: 20px;
}

.apply-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 32px;
  margin: 0 auto;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.apply-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
}

.apply-btn:disabled {
  background: #c8e6c9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.apply-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .header {
    padding: 16px;
    margin-bottom: 20px;
  }

  .title {
    font-size: 24px;
  }

  .card-body {
    padding: 20px;
  }

  .scanner-wrapper {
    max-width: 100%;
  }

  .scanner-frame {
    width: 150px;
    height: 150px;
  }
}
</style>