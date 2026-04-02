const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

app.get('/notes', (req, res) => {
  db.query("SELECT * FROM notes", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post('/notes', (req, res) => {
  const { title, content } = req.body;
  db.query("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content]);
  res.json({ message: "Created" });
});

app.get('/notes/search', (req, res) => {
  const q = req.query.q;
  db.query(
    "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ?",
    [`%${q}%`, `%${q}%`],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.listen(process.env.PORT, () => console.log("Server running"));
