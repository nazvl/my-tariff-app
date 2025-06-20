import { users } from '@/other/mockData.js';

// Функция авторизации с имитацией Fetch API
async function loginF(login, password) {
  // Имитируем fetch запрос с задержкой
  const mockResponse = await new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(u => u.login === login && u.password === password);
      
      if (user) {
        resolve({
          ok: true,
          json: () => Promise.resolve({ token: user.token })
        });
      } else {
        resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized'
        });
      }
    }, 1200);
  });

  if (!mockResponse.ok) {
    throw new Error('Неверный логин или пароль');
  }

  return await mockResponse.json();
}

export { loginF };