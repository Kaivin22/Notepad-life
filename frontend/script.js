const API_BASE = '/api'; // Backend sẽ proxy "/api" hoặc chạy cùng URL

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
      fetch(fUrl).then(r => r.json()),
      fetch(nUrl).then(r => r.json())
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
    const div = document.createElement('div');
    div.className = 'card folder';
    div.onclick = () => {
      currentFolderId = f.id;
      currentPath.push({ id: f.id, name: f.name });
      loadData();
    };
    div.innerHTML = `
      <div class="card-icon">📁</div>
      <h3>${f.name}</h3>
      <div class="card-actions" onclick="event.stopPropagation()">
        <button onclick="openEditFolder(${f.id}, '${f.name}')">Sửa</button>
        <button class="btn-del" onclick="deleteFolder(${f.id}, '${f.name}')">Xóa</button>
      </div>
    `;
    contentArea.appendChild(div);
  });

  // Render Notes
  notes.forEach(n => {
    const div = document.createElement('div');
    div.className = 'card note';
    div.innerHTML = `
      <div class="card-icon">📝</div>
      <h3>${n.title}</h3>
      <p>${n.content}</p>
      <div class="card-actions">
        <button onclick="downloadNote('${n.title}', \`${n.content.replace(/`/g, '\\`')}\`)">Tải .txt</button>
        <button onclick="openEditNote(${n.id}, '${n.title}', \`${n.content.replace(/`/g, '\\`')}\`)">Sửa</button>
        <button class="btn-del" onclick="deleteNote(${n.id}, '${n.title}')">Xóa</button>
      </div>
    `;
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
    await fetch(`/folders/${editItem.id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: name })
    });
  } else {
    await fetch(`/folders`, {
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
    await fetch(`/notes/${editItem.id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, content, folder_id: currentFolderId })
    });
  } else {
    await fetch(`/notes`, {
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
    await fetch(`/folders/${id}`, { method: 'DELETE' });
    loadData();
  }
}
async function deleteNote(id, title) {
  if (confirm(`Bạn có chắc muốn xóa ghi chú "${title}"?`)) {
    await fetch(`/notes/${id}`, { method: 'DELETE' });
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

// Chạy lần đầu
loadData();
