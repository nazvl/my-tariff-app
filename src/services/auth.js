import { users } from '@/other/mockData.js';

// Функция авторизации: принимает логин и пароль
function loginF(login, password) {
  return new Promise((resolve, reject) => {
    
    // Используем setTimeout для имитации задержки ответа сервера (1.2 секунды)
    setTimeout(() => {
      // Ищем пользователя в массиве users с совпадающим логином и паролем
      const user = users.find(u => u.login === login && u.password === password);

      if (user) {
        // Если пользователь найден, возвращаем объект с токеном
        resolve({ token: user.token });
      } else {
        // Если пользователь не найден — отклоняем промис с ошибкой
        reject(new Error('Неверный логин или пароль'));
      }
    }, 1200); // задержка 1200 миллисекунд
  });
}

export { loginF };
