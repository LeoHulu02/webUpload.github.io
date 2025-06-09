// ---------- Cloudinary Config ----------
const CLOUD_NAME    = "dikwqr0lv";
const UPLOAD_PRESET = "preset_upload";

// ---------- Setup Halaman ----------
const user = getCurrentUser();
if (!user) {
  // Belum login
  window.location.href = "login.html";
}

// Header
document.getElementById("greeting").textContent =
  `Halo, ${user.fullName} (${user.role})`;
document.getElementById("logoutBtn").addEventListener("click", () => {
  logout();
  window.location.href = "login.html";
});

// ----- DOM -----
const userSection     = document.getElementById("userSection");
const adminSection    = document.getElementById("adminSection");
const userTable       = document.getElementById("userTable");
const adminTable      = document.getElementById("adminTable");
const fileInput       = document.getElementById("fileInput");
const uploadBtn       = document.getElementById("uploadBtn");
const statusText      = document.getElementById("status");

// Tampilkan sesuai role
if (user.role === "user") {
  userSection.classList.remove("hidden");
  renderUserTable();
  uploadBtn.addEventListener("click", handleUpload);
} else {
  adminSection.classList.remove("hidden");
  renderAdminTable();
}

// ---------- Upload ----------
async function handleUpload() {
  const file = fileInput.files[0];
  if (!file) {
    alert("Pilih file terlebih dahulu!");
    return;
  }

  statusText.textContent = "Uploading...";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    const files = getFiles();
    files.push({
      id: Date.now(),
      url: data.secure_url,
      fileName: file.name,
      fileType: file.type,
      ownerUsername: user.username,
      ownerFullName: user.fullName
    });
    saveFiles(files);

    statusText.textContent = "Upload berhasil!";
    fileInput.value = "";
    renderUserTable();
  } catch (err) {
    console.error(err);
    statusText.textContent = "Gagal upload!";
  }
}

// ---------- Tabel User ----------
function renderUserTable() {
  const files = getFiles().filter(f => f.ownerUsername === user.username);
  makeFileTable(userTable, files, true);
}

// ---------- Tabel Admin ----------
function renderAdminTable() {
  const files = getFiles();
  makeFileTable(adminTable, files, false);
}

// ---------- Util buat Tabel ----------
function makeFileTable(root, files, isUser) {
  if (!files.length) {
    root.innerHTML = "<tr><td class='p-2 text-center'>Belum ada data</td></tr>";
    return;
  }

  const rows = files.map((f, i) => `
    <tr class="border-t">
      <td class="p-2">${i + 1}</td>
      <td class="p-2">${f.fileName}</td>
      <td class="p-2">${f.fileType}</td>
      <td class="p-2">
        <a href="${f.url}" target="_blank" class="text-blue-600 underline">Preview</a>
      </td>
      ${isUser ? "" : `<td class="p-2">${f.ownerFullName}</td>`}
      <td class="p-2 space-x-2">
        <button class="text-yellow-600" onclick="editFile(${f.id})">Edit</button>
        <button class="text-red-600" onclick="deleteFile(${f.id})">Hapus</button>
        ${isUser ? "" : `
          <button class="text-green-600" onclick="editUserName('${f.ownerUsername}')">
            Edit Nama User
          </button>`}
      </td>
    </tr>
  `).join("");

  const head = `
    <thead class="bg-gray-200">
      <tr>
        <th class="p-2">#</th>
        <th class="p-2">Nama File</th>
        <th class="p-2">Tipe</th>
        <th class="p-2">Link</th>
        ${isUser ? "" : `<th class="p-2">User</th>`}
        <th class="p-2">Aksi</th>
      </tr>
    </thead>`;

  root.innerHTML = head + `<tbody>${rows}</tbody>`;
}

// ---------- Aksi File ----------
window.deleteFile = id => {
  if (!confirm("Hapus file ini?")) return;
  const files = getFiles().filter(f => f.id !== id);
  saveFiles(files);
  user.role === "user" ? renderUserTable() : renderAdminTable();
};

window.editFile = id => {
  const files = getFiles();
  const idx   = files.findIndex(f => f.id === id);
  const newName = prompt("Nama file baru:", files[idx].fileName);
  if (!newName) return;
  files[idx].fileName = newName;
  saveFiles(files);
  user.role === "user" ? renderUserTable() : renderAdminTable();
};

// ---------- Aksi Admin: ubah nama user ----------
window.editUserName = username => {
  const users = getUsers();
  const idx   = users.findIndex(u => u.username === username);
  if (idx === -1) return;

  const newName = prompt("Nama lengkap baru:", users[idx].fullName);
  if (!newName) return;

  users[idx].fullName = newName;
  saveUsers(users);

  // Perbarui nama pada semua file milik user tsb
  const files = getFiles().map(f =>
    f.ownerUsername === username ? { ...f, ownerFullName: newName } : f
  );
  saveFiles(files);

  renderAdminTable();
};
