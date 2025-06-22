import { useTariffStore } from "@/store/tariff.js";
import { setItem, getItem } from "@/api/idb.js";

async function synchronizer() {
    // Получаем хранилище тарифов
    const tariffStore = useTariffStore()
    
    // Получаем тарифы из IndexedDB или пустой массив, если их нет
    const tariffsFromIdb = await getItem('tariffs') || []
    // Получаем тарифы из текущего состояния хранилища
    const tariffsFromStore = tariffStore.tariffs;

    // Объединяем тарифы из хранилища и IndexedDB, исключая дубликаты
    const tarrifsSummarized = [
        ...tariffsFromStore,
        // Добавляем тарифы из IndexedDB, которых нет в хранилище
        ...tariffsFromIdb.filter(idbTariff => 
            !tariffsFromStore.some(storeTariff => 
                // Сравниваем по значению и qrs-кодам
                storeTariff.val === idbTariff.val && 
                JSON.stringify(storeTariff.qrs) === JSON.stringify(idbTariff.qrs)
            )
        )
    ]

    console.log('Отправка на сервер', tarrifsSummarized);
    
    // Преобразуем в обычные объекты для IndexedDB
    const plainTariffs = JSON.parse(JSON.stringify(tarrifsSummarized));
    
    // Сохраняем объединенные тарифы в IndexedDB
    await setItem('tariffs', plainTariffs);
    // Обновляем состояние хранилища
    tariffStore.tariffs = plainTariffs;
    
    console.log('Синхронизация завершена');
    return plainTariffs;
}

export { synchronizer }