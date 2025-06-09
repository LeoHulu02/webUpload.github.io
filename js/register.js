document.getElementById("registerForm").addEventListener("submit", e => {
  e.preventDefault();

  const fullName = e.target.fullName.value.trim();
  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();

  if (!fullName || !username || !password) {
    alert("Semua input wajib diisi!");
    return;
  }

  const users = getUsers();
  if (users.some(u => u.username === username)) {
    alert("Username sudah dipakai!");
    return;
  }

  users.push({
    id: Date.now(),
    fullName,
    username,
    password,
    role: "user"
  });
  saveUsers(users);

  alert("Registrasi berhasil! Silakan login.");
  window.location.href = "login.html";
});
