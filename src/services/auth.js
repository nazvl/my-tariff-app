import { users } from "@/other/mockData.js";

// Функция авторизации с имитацией Fetch API
async function loginF(login, password) {
  const mockResponse = await new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(
        (u) => u.login === login && u.password === password
      );
      // если данные совпали
      if (user) {
        resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.resolve({ token: user.token }), 
        });
      } else {
        resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        });
      }
    }, 1200);
  });

  if (mockResponse.status === 401) {
    throw new Error("Неверный логин или пароль");
  }
  else if(mockResponse.status !== 200 && !mockResponse.ok) { // обработка кодов ошибок кроме 401 (в будущем)
    throw new Error(`Произошла ошибка ${mockResponse.status}, попробуйте позднее.`); 
  }

  return await mockResponse.json();
}
  
// Функция проверки токена
async function validateToken(token) {
  const mockResponse = await new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.token === token);
      
      if (user) {
        resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.resolve({ valid: true, user: user })
        });
      } else {
        resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          json: () => Promise.resolve({ valid: false })
        });
      }
    }, 500);
  });

  if (mockResponse.status === 401) {
    throw new Error("Токен недействителен");
  }

  return await mockResponse.json();
}

export { loginF, validateToken };
