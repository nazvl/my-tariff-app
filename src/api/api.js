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

export async function getTariffs() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(tariffs);
        }, 500);
    });
}