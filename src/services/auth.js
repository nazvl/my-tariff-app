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
        // имитация Fetch
        resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.resolve({ token: user.token }), // имитация Fetch
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

  if (mockResponse.status !== 200) {
    throw new Error("Неверный логин или пароль");
  }

  return await mockResponse.json();
}

export { loginF };
