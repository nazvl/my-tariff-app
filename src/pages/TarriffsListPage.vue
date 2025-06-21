<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useTariffsStore } from '@/stores/tariffs.js'
import { onMounted } from 'vue';
import { ref } from 'vue'

const authStore = useAuthStore();
const tariffsStore = useTariffsStore();
let token = ref('');

onMounted(async () => {
    token.value = authStore.token;
    await tariffsStore.loadTariffs();
})

const syncWithServer = async () => {
    await tariffsStore.loadTariffsFromServer();
}
</script>


<template>
    <div>
        <h1>Список тарифов</h1>
        <button @click="syncWithServer" :disabled="tariffsStore.loading">
            Синхронизировать с сервером
        </button>
        <div v-if="tariffsStore.loading">Загрузка...</div>
        <div v-else>
            <div v-for="tariff in tariffsStore.tariffs" :key="tariff.id">
                <p>Тариф: {{ tariff.val }}</p>
                <p>QR коды: {{ tariff.qrs.join(', ') }}</p>
                <p>Обработан: {{ tariff.processed ? 'Да' : 'Нет' }}</p>
                <p>Создан: {{ new Date(tariff.created).toLocaleString() }}</p>
                <hr>
            </div>
        </div>
    </div>
</template>