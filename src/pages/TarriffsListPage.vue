<script setup>
import { useAuthStore } from "@/store/auth.js";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getTariffs } from "../api/api.js";

const authStore = useAuthStore();
const router = useRouter();

const tariffs = ref([]);

onMounted(() => {
  fetchTariffs();
});

async function fetchTariffs() {
  try {
    const result = await getTariffs();
    // console.log('getTariffs result:', result);
    tariffs.value = result;
  } catch (err) {
    console.log('Ошибка в получении тарифов:', err);
  }
}

function logout() {
  console.log(authStore.token);
  authStore.logout();
  router.push("/login");
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Список тарифов</h1>
      <button @click="logout" class="logout-btn">ВЫХОД</button>
    </div>
    
    <div v-if="tariffs.length" class="tariffs-grid">
      <div v-for="tariff in tariffs" :key="tariff.id" class="tariff-card">
        <p class="tariff-val">{{ tariff.val }}</p>
        <p class="tariff-qrs">QRs: {{ tariff.qrs.join(', ') }}</p>
        <p class="tariff-created">Создан: {{ tariff.created.split("T")[0] }}</p>
      </div>
    </div>
    
    <div v-else class="loading">
      Загрузка тарифов...
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.tariffs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tariff-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tariff-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tariff-val {
  font-size: 18px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 10px;
}

.tariff-qrs {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.tariff-created {
  font-size: 14px;
  color: #999;
  margin-bottom: 0;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 40px;
}

.no-tariffs {
  text-align: center;
  color: #666;
  padding: 40px;
}
</style>