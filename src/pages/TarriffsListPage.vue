<script setup>
import { useAuthStore } from "@/store/auth.js";
import { useTariffStore } from "@/store/tariff.js";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { synchronizer } from "../api/synchronizeWithServer";

const authStore = useAuthStore();
const tariffStore = useTariffStore();
const router = useRouter();

onMounted(async () => {
  try {
    // Загружаем тарифы (включая объединение с локальными)
    await fetchTariffs();
  } catch (err) {
    console.error("Ошибка загрузки тарифов:", err);
  }
});

async function fetchTariffs() {
  try {
    const result = await tariffStore.fetchTariffs();
  } catch (err) {
    console.log("Ошибка в получении тарифов:", err);
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
      <div class="btns">
        <button @click="logout" class="logout-btn">ВЫХОД</button>
        <button @click="router.push('/apply')" class="add-btn">
          Добавить тариф
        </button>
        <button @click="synchronizer" class="logout-btn">sync</button>
      </div>
    </div>

    <div v-if="tariffStore.tariffs.length" class="tariffs-grid">
      <div
        v-for="tariff in tariffStore.tariffs"
        :key="tariff.id"
        class="tariff-card"
      >
        <p class="tariff-val">{{ tariff.val }}</p>
        <p class="tariff-qrs">QRs: {{ tariff.qrs.join(", ") }}</p>
        <p class="tariff-created">Создан: {{ tariff.created.split("T")[0] }}</p>
        <p class="tariff-created">
          Обработан: {{ tariff.processed ? "Да" : "Нет" }}
        </p>
      </div>
    </div>

    <div v-else class="loading">Загрузка тарифов...</div>
  </div>
</template>

<style scoped>
.container {
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
  z-index: 10;
}
.btns {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 120px;
}

.logout-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: translateY(0);
}

.add-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 160px;
}

.add-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.add-btn:active {
  transform: translateY(0);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.tariffs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding-bottom: 20px;
}

.tariff-card {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.tariff-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tariff-card:active {
  transform: translateY(-2px);
}

.tariff-val {
  font-size: 20px;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 12px;
  line-height: 1.3;
}

.tariff-qrs {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
  word-break: break-word;
}

.tariff-created {
  font-size: 14px;
  color: #999;
  margin-bottom: 0;
  line-height: 1.4;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-tariffs {
  text-align: center;
  color: #666;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .header {
    padding: 16px;
    margin-bottom: 20px;
    flex-direction: column;
    gap: 16px;
    position: static;
  }

  .title {
    font-size: 20px;
    text-align: center;
  }

  .tariffs-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tariff-card {
    padding: 16px;
  }

  .logout-btn {
    width: 100%;
    justify-self: stretch;
  }
}

/* Touch-friendly interactions */
@media (hover: none) {
  .tariff-card:hover {
    transform: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .logout-btn:hover {
    background-color: #f44336;
    transform: none;
  }
}
</style>
