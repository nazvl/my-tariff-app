import mockData from './mockData.json'

const { users, tariffs } = mockData;

export async function login(username, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => u.login === username);
            
            if (user && user.password === password) {
                resolve({
                    success: true,
                    user: {
                        login: user.login
                    },
                    token: user.token,
                });
            } else if (user && user.password !== password) {
                reject({
                    error: 'Неверный пароль',
                });
            } else {
                reject({
                    error: "Пользователь не найден",
                });
            }
        }, 1200);
    });
}
// Получение тарифов от "сервера"
export async function getTariffs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // Добавляем статус true каждому тарифу
                for(let i in tariffs) {
                    tariffs[i].processed = true;
                }
                
                if (tariffs && Array.isArray(tariffs)) {
                    resolve(tariffs);
                } else {
                    reject({
                        error: 'Тарифы не найдены или неверный формат данных'
                    });
                }
            } catch (error) {
                reject({
                    error: 'Ошибка при загрузке тарифов'
                });
            }
        }, 2000);
    });
}