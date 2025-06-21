import { tariffs } from "../other/mockData";
import { saveTariff, clearAllTariffs } from "../other/idb";

async function getTariffsFromServer() {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                // Очищаем все существующие тарифы перед загрузкой новых
                await clearAllTariffs();
                
                // Загружаем тарифы с сервера
                for (const tariff of tariffs) {
                    await saveTariff(tariff);
                }
                resolve(tariffs);
            } catch (error) {
                console.error('Error saving tariffs:', error);
                reject(error);
            }
        }, 1200);
    });
}

export { getTariffsFromServer };