// Key konstanta
const USERS_KEY        = "users";
const FILES_KEY        = "files";
const CURRENT_USER_KEY = "currentUser";

// -------------------- Inisialisasi Admin --------------------
(function initAdmin() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  if (!users.some(u => u.role === "admin")) {
    users.push({
      id: Date.now(),
      fullName: "Administrator",
      username: "admin",
      password: "admin123",
      role: "admin"
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
})();

// -------------------- Helper ▼ --------------------
const getUsers       = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
const saveUsers      = arr => localStorage.setItem(USERS_KEY, JSON.stringify(arr));

const getFiles       = () => JSON.parse(localStorage.getItem(FILES_KEY)) || [];
const saveFiles      = arr => localStorage.setItem(FILES_KEY, JSON.stringify(arr));

const setCurrentUser = user => sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
const getCurrentUser = ()   => JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY));
const logout         = ()   => sessionStorage.removeItem(CURRENT_USER_KEY);
