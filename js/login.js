document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();

  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();

  const user = getUsers().find(u => u.username === username && u.password === password);
  if (!user) {
    alert("Username atau password salah!");
    return;
  }

  setCurrentUser(user);
  window.location.href = "index.html";
});
