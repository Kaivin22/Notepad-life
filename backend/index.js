const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));


const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'notedb',
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("MySQL Connected");
  initDB();
});

function initDB() {
  const createFolders = `
    CREATE TABLE IF NOT EXISTS folders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      parent_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );
  `;
  const createNotes = `
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      folder_id INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );
  `;
  db.query(createFolders, err => {
    if (err) console.error("Error creating folders table:", err);
    else {
      db.query(createNotes, err => {
        if (err) console.error("Error creating notes table:", err);
      });
    }
  });
}

// ------ FOLDERS API ------

// Get folders (optional query ?parent_id=... to get subfolders)
// Search folders - MUST be before /folders/:id
app.get('/folders/search', (req, res) => {
  const q = req.query.q || '';
  db.query(
    "SELECT * FROM folders WHERE name LIKE ?",
    [`%${q}%`],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
});

app.get('/folders', (req, res) => {
  const parent_id = req.query.parent_id;
  let query = "SELECT * FROM folders WHERE parent_id IS NULL";
  let params = [];
  if (parent_id) {
    query = "SELECT * FROM folders WHERE parent_id = ?";
    params = [parent_id];
  }
  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

app.post('/folders', (req, res) => {
  const { name, parent_id } = req.body;
  const pId = parent_id || null;
  db.query("INSERT INTO folders (name, parent_id) VALUES (?, ?)", [name, pId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Folder Created", id: result.insertId });
  });
});

app.put('/folders/:id', (req, res) => {
  const { name } = req.body;
  const id = req.params.id;
  db.query("UPDATE folders SET name = ? WHERE id = ?", [name, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Folder Updated" });
  });
});

app.delete('/folders/:id', (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM folders WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Folder Deleted" });
  });
});

// ------ NOTES API ------

// Search notes - MUST be before /notes/:id
app.get('/notes/search', (req, res) => {
  const q = req.query.q || '';
  db.query(
    "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ?",
    [`%${q}%`, `%${q}%`],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result);
    }
  );
});

app.get('/notes', (req, res) => {
  const folder_id = req.query.folder_id;
  let query = "SELECT * FROM notes WHERE folder_id IS NULL";
  let params = [];
  if (folder_id) {
    query = "SELECT * FROM notes WHERE folder_id = ?";
    params = [folder_id];
  }
  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

app.post('/notes', (req, res) => {
  const { title, content, folder_id } = req.body;
  const fId = folder_id || null;
  db.query("INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)", [title, content, fId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Note Created", id: result.insertId });
  });
});

app.put('/notes/:id', (req, res) => {
  const { title, content, folder_id } = req.body;
  const id = req.params.id;
  const fId = folder_id || null;
  db.query("UPDATE notes SET title = ?, content = ?, folder_id = ? WHERE id = ?", [title, content, fId, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Note Updated" });
  });
});

app.delete('/notes/:id', (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM notes WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Note Deleted" });
  });
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
