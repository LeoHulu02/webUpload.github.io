// ---------- Cloudinary Config ----------
const CLOUD_NAME = "dikwqr0lv";
const UPLOAD_PRESET = "preset_upload";

// ---------- Setup ----------
const user = getCurrentUser();
if (!user) window.location.href = "login.html";

document.getElementById("greeting").textContent = `Halo, ${user.fullName} (${user.role})`;
document.getElementById("logoutBtn").onclick = () => {
  logout();
  window.location.href = "login.html";
};

const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("userTableBody");

// ---------- Dialog Elements ----------
const dialogOverlay = document.getElementById("dialogOverlay");
const dialogBox = document.getElementById("dialogBox");
const dialogTitle = document.getElementById("dialogTitle");
const dialogContent = document.getElementById("dialogContent");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const cancelDialogBtn = document.getElementById("cancelDialogBtn");
const confirmDialogBtn = document.getElementById("confirmDialogBtn");

// ---------- Delete Confirm ----------
const deleteConfirmOverlay = document.getElementById("deleteConfirmOverlay");
const closeDeleteConfirmBtn = document.getElementById("closeDeleteConfirmBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

document.getElementById("addBtn").onclick = showAddDialog;
closeDialogBtn.onclick = hideDialog;
cancelDialogBtn.onclick = hideDialog;
closeDeleteConfirmBtn.onclick = hideDeleteConfirm;
cancelDeleteBtn.onclick = hideDeleteConfirm;

// ---------- Cloudinary Upload ----------
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload gagal");
  return {
    url: data.secure_url,
    fileName: file.name,
    fileType: file.type,
  };
}

// ---------- Dialog Utility ----------
function showDialog(title, content, onConfirm) {
  dialogTitle.textContent = title;
  dialogContent.innerHTML = content;
  dialogOverlay.classList.remove("hidden");
  dialogBox.classList.remove("hidden");
  confirmDialogBtn.onclick = async () => {
    const ok = await onConfirm();
    if (ok !== false) hideDialog();
  };
}
function hideDialog() {
  dialogOverlay.classList.add("hidden");
  dialogBox.classList.add("hidden");
}
function showDeleteConfirm(onConfirm) {
  deleteConfirmOverlay.classList.remove("hidden");
  confirmDeleteBtn.onclick = () => {
    onConfirm();
    hideDeleteConfirm();
  };
}
function hideDeleteConfirm() {
  deleteConfirmOverlay.classList.add("hidden");
}

// ---------- Render Table ----------
function renderTable() {
  const allFiles = getFiles();
  const files = user.role === "admin" ? allFiles : allFiles.filter(f => f.ownerUsername === user.username);

  tableHead.innerHTML = `
    <tr>
      <th class="px-4 py-3">No</th>
      <th class="px-4 py-3">Judul</th>
      <th class="px-4 py-3">Ringkasan</th>
      <th class="px-4 py-3">File</th>
      ${user.role === "admin" ? '<th class="px-4 py-3">User</th>' : ""}
      <th class="px-4 py-3 text-right">Aksi</th>
    </tr>
  `;

  tableBody.innerHTML = "";

  if (!files.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500">Belum ada data.</td></tr>`;
    return;
  }

  files.forEach((f, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="px-4 py-2">${i + 1}</td>
      <td class="px-4 py-2">${f.title}</td>
      <td class="px-4 py-2">${f.summary}</td>
      <td class="px-4 py-2"><a href="${f.url}" class="text-blue-600 underline" target="_blank">${f.fileName}</a></td>
      ${user.role === "admin" ? `<td class="px-4 py-2">${f.ownerFullName}</td>` : ""}
      <td class="px-4 py-2 text-right space-x-2">
        <button class="text-yellow-600" onclick="editData(${f.id})">Edit</button>
        <button class="text-red-600" onclick="deleteData(${f.id})">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ---------- Tambah ----------
function showAddDialog() {
  showDialog("Tambah Data", `
    <div class="space-y-4">
      <input id="titleInput" type="text" placeholder="Judul" class="w-full border rounded px-3 py-2" />
      <textarea id="summaryInput" rows="3" placeholder="Ringkasan" class="w-full border rounded px-3 py-2"></textarea>
      <input id="fileInput" type="file" class="w-full" />
    </div>
  `, async () => {
    const title = document.getElementById("titleInput").value.trim();
    const summary = document.getElementById("summaryInput").value.trim();
    const file = document.getElementById("fileInput").files[0];

    if (!title || !summary || !file) {
      alert("Semua field harus diisi.");
      return false;
    }

    const uploaded = await uploadToCloudinary(file);
    const files = getFiles();
    files.push({
      id: Date.now(),
      title,
      summary,
      ...uploaded,
      ownerUsername: user.username,
      ownerFullName: user.fullName
    });
    saveFiles(files);
    renderTable();
    return true;
  });
}

// ---------- Edit ----------
window.editData = function(id) {
  const files = getFiles();
  const file = files.find(f => f.id === id);
  if (!file) return;

  showDialog("Edit Data", `
    <div class="space-y-4">
      <input id="editTitle" value="${file.title}" class="w-full border rounded px-3 py-2" />
      <textarea id="editSummary" rows="3" class="w-full border rounded px-3 py-2">${file.summary}</textarea>
      <input id="editFile" type="file" class="w-full" />
    </div>
  `, async () => {
    const title = document.getElementById("editTitle").value.trim();
    const summary = document.getElementById("editSummary").value.trim();
    const fileInput = document.getElementById("editFile").files[0];

    if (!title || !summary) {
      alert("Field wajib diisi.");
      return false;
    }

    if (fileInput) {
      const uploaded = await uploadToCloudinary(fileInput);
      Object.assign(file, uploaded);
    }

    Object.assign(file, { title, summary });
    saveFiles(files);
    renderTable();
    return true;
  });
};

// ---------- Hapus ----------
window.deleteData = function(id) {
  showDeleteConfirm(() => {
    const files = getFiles().filter(f => f.id !== id);
    saveFiles(files);
    renderTable();
  });
};

// ---------- Init ----------
renderTable();
