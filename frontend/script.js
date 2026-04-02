const API_BASE = 'http://localhost:5000';

const apiFetch = (path, options) => fetch(API_BASE + path, options);

let currentFolderId = null;
let currentPath = [{ id: null, name: 'Home' }];

let editItem = null; // { id, type }

// Elements
const contentArea = document.getElementById('content-area');
const breadcrumbs = document.getElementById('breadcrumbs');
const folderModal = document.getElementById('folder-modal');
const noteModal = document.getElementById('note-modal');

async function loadData() {
  contentArea.innerHTML = '<i>Đang tải...</i>';
  try {
    const fUrl = currentFolderId ? `/folders?parent_id=${currentFolderId}` : '/folders';
    const nUrl = currentFolderId ? `/notes?folder_id=${currentFolderId}` : '/notes';
    
    // Yêu cầu lấy dữ liệu bằng Fetch API
    const [resF, resN] = await Promise.all([
      apiFetch(fUrl).then(r => r.json()),
      apiFetch(nUrl).then(r => r.json())
    ]);

    renderBreadcrumbs();
    renderContent(resF, resN);
  } catch (error) {
    console.error(error);
    contentArea.innerHTML = '<p style="color:red">Lỗi kết nối Backend!</p>';
  }
}

function renderBreadcrumbs() {
  breadcrumbs.innerHTML = '';
  currentPath.forEach((p, idx) => {
    const span = document.createElement('span');
    span.innerText = p.name;
    span.onclick = () => {
      currentPath = currentPath.slice(0, idx + 1);
      currentFolderId = p.id;
      loadData();
    };
    breadcrumbs.appendChild(span);
    if (idx < currentPath.length - 1) {
      breadcrumbs.appendChild(document.createTextNode(' > '));
    }
  });
}

function renderContent(folders, notes) {
  contentArea.innerHTML = '';
  
  if(folders.length === 0 && notes.length === 0) {
    contentArea.innerHTML = '<p>Thư mục trống.</p>';
    return;
  }

  // Render Folders
  folders.forEach(f => {
    const safeName = (f.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const div = document.createElement('div');
    div.className = 'card folder';
    div.onclick = () => {
      currentFolderId = f.id;
      currentPath.push({ id: f.id, name: f.name });
      loadData();
    };
    div.innerHTML = `
      <div class="card-icon">📁</div>
      <h3>${safeName}</h3>
      <div class="card-actions">
        <button class="btn-edit">Sửa</button>
        <button class="btn-del">Xóa</button>
      </div>
    `;
    div.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openEditFolder(f.id, f.name);
    };
    div.querySelector('.btn-del').onclick = (e) => {
      e.stopPropagation();
      deleteFolder(f.id, f.name);
    };
    contentArea.appendChild(div);
  });

  // Render Notes
  notes.forEach(n => {
    const safeTitle = (n.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeContent = (n.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const div = document.createElement('div');
    div.className = 'card note';
    div.innerHTML = `
      <div class="card-icon">📝</div>
      <h3>${safeTitle}</h3>
      <p>${safeContent}</p>
      <div class="card-actions">
        <button class="btn-download">Tải .txt</button>
        <button class="btn-edit">Sửa</button>
        <button class="btn-del">Xóa</button>
      </div>
    `;
    div.querySelector('.btn-download').onclick = (e) => {
      e.stopPropagation();
      downloadNote(n.title, n.content);
    };
    div.querySelector('.btn-edit').onclick = (e) => {
      e.stopPropagation();
      openEditNote(n.id, n.title, n.content);
    };
    div.querySelector('.btn-del').onclick = (e) => {
      e.stopPropagation();
      deleteNote(n.id, n.title);
    };
    contentArea.appendChild(div);
  });
}

// Modals
function closeModals() {
  folderModal.classList.remove('active');
  noteModal.classList.remove('active');
  editItem = null;
}
function openFolderModal() { 
  document.getElementById('folder-name').value = '';
  folderModal.classList.add('active'); 
}
function openNoteModal() { 
  document.getElementById('note-title').value = '';
  document.getElementById('note-content').value = '';
  noteModal.classList.add('active'); 
}
function openEditFolder(id, name) {
  editItem = { id: id, type: 'folder' };
  document.getElementById('folder-name').value = name;
  folderModal.classList.add('active');
}
function openEditNote(id, title, content) {
  editItem = { id: id, type: 'note' };
  document.getElementById('note-title').value = title;
  document.getElementById('note-content').value = content;
  noteModal.classList.add('active');
}
function navigateToRoot() {
  currentFolderId = null;
  currentPath = [{ id: null, name: 'Home' }];
  loadData();
}

// Actions
async function saveFolder() {
  const name = document.getElementById('folder-name').value;
  if (!name) return alert('Nhập tên thư mục!');
  
  if (editItem && editItem.type === 'folder') {
    await apiFetch(`/folders/${editItem.id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: name })
    });
  } else {
    await apiFetch(`/folders`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: name, parent_id: currentFolderId })
    });
  }
  closeModals();
  loadData();
}

async function saveNote() {
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  if (!title) return alert('Nhập tiêu đề!');
  
  if (editItem && editItem.type === 'note') {
    await apiFetch(`/notes/${editItem.id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, content, folder_id: currentFolderId })
    });
  } else {
    await apiFetch(`/notes`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, content, folder_id: currentFolderId })
    });
  }
  closeModals();
  loadData();
}

// Delete functions
async function deleteFolder(id, name) {
  if (confirm(`Bạn có chắc muốn xóa thư mục "${name}" cùng toàn bộ dữ liệu bên trong?`)) {
    await apiFetch(`/folders/${id}`, { method: 'DELETE' });
    loadData();
  }
}
async function deleteNote(id, title) {
  if (confirm(`Bạn có chắc muốn xóa ghi chú "${title}"?`)) {
    await apiFetch(`/notes/${id}`, { method: 'DELETE' });
    loadData();
  }
}

// Download
function downloadNote(title, content) {
  const element = document.createElement("a");
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${title}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Search functionality
let debounceTimer;

function handleSearch() {
  const query = document.getElementById('search-input').value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (query.length > 0) {
      performSearch(query);
    } else {
      currentFolderId = null;
      currentPath = [{ id: null, name: 'Home' }];
      loadData();
    }
  }, 300);
}

async function performSearch(query) {
  contentArea.innerHTML = '<i>Đang tìm kiếm...</i>';
  try {
    const [resF, resN] = await Promise.all([
      apiFetch(`/folders/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
      apiFetch(`/notes/search?q=${encodeURIComponent(query)}`).then(r => r.json())
    ]);

    breadcrumbs.innerHTML = `<span>Kết quả tìm kiếm cho: "${query}"</span>`;
    renderContent(resF, resN);
  } catch (error) {
    console.error(error);
    contentArea.innerHTML = '<p style="color:red">Lỗi tìm kiếm!</p>';
  }
}

// Upload file .txt từ máy lên
async function uploadFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.name.endsWith('.txt')) return alert('Chỉ chấp nhận file .txt!');

  const formData = new FormData();
  formData.append('file', file);
  if (currentFolderId) formData.append('folder_id', currentFolderId);

  try {
    const res = await apiFetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) return alert('Lỗi: ' + (data.error || 'Không thể tải lên'));
    alert(`✅ Đã tải lên thành công!\nNote: "${data.title}"`);
    input.value = ''; // reset input để chọn lại cùng file nếu cần
    loadData();
  } catch (err) {
    console.error(err);
    alert('Lỗi kết nối khi tải file lên!');
  }
}

// Chạy lần đầu
loadData();
