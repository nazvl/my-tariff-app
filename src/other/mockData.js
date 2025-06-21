const users = [
  { id: 1, login: "user1", password: "pass1", token: "token123" },
  { id: 2, login: "user2", password: "pass2", token: "token456" },
];

// tariffs = <tariff>[] – массив со списком объектов примененных тарифов
// tariff = {val: <int>, qrs: <string>[], processed: <bool>, created: <datetime>} – объект тарифа, где:
//     • val – тариф: один из 3 вариантов;
//     • qrs – массив qr объектов;
//     • processed – признак обработки на стороне сервера;
//     • created – дата и время сканирования qr по данным сканирующего устройства.

const tariffs = [
  {
    val: "T1",
    qrs: ["123456", "654312"],
    processed: true,
    created: "2025-06-20T19:00:00Z",
  },
  {
    val: "T3",
    qrs: ["132356"],
    processed: false,
    created: "2025-06-19T18:30:00Z",
  },
];

export { tariffs, users }