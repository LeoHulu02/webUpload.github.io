// register.js (versi Supabase)
document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault()

  const fullName = e.target.fullName.value.trim()
  const username = e.target.username.value.trim()
  const password = e.target.password.value.trim()

  if (!fullName || !username || !password) {
    alert("Semua input wajib diisi!")
    return
  }

  const taken = await isUsernameTaken(username)
  if (taken) {
    alert("Username sudah dipakai!")
    return
  }

  const success = await registerUser({
    id: Date.now(),
    full_name: fullName,
    username,
    password,
    role: "user"
  })

  if (success) {
    alert("Registrasi berhasil! Silakan login.")
    window.location.href = "login.html"
  } else {
    alert("Registrasi gagal. Coba lagi nanti.")
  }
})
