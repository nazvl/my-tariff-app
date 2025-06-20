const users = [
  { id: 1, login: "user1", password: "pass1", token: "token123" },
  { id: 2, login: "user2", password: "pass2", token: "token456" },
];

const tariffs = [
  {
    val: "T1",
    qrs: ["qr1", "qr2"],
    processed: true,
    created: "2025-06-20T19:00:00Z",
  },
  {
    val: "T3",
    qrs: ["qr3"],
    processed: false,
    created: "2025-06-19T18:30:00Z",
  },
];

export { tariffs, users }