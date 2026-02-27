const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// This creates your permanent file: selah_memory.db
const db = new sqlite3.Database('./selah_memory.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to the permanent SQLite database.');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    title TEXT,
    updatedAt TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT,
    role TEXT,
    content TEXT,
    FOREIGN KEY(chat_id) REFERENCES chats(id)
  )`);
});

// API Routes
app.get('/api/chats', (req, res) => {
  db.all(`SELECT * FROM chats ORDER BY updatedAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/chats', (req, res) => {
  const { id, title, updatedAt } = req.body;
  db.run(`INSERT INTO chats (id, title, updatedAt) VALUES (?, ?, ?)`, [id, title, updatedAt], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id });
  });
});

app.put('/api/chats/:id', (req, res) => {
  const { title, updatedAt } = req.body;
  db.run(`UPDATE chats SET title = ?, updatedAt = ? WHERE id = ?`, [title, updatedAt, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ updated: this.changes });
  });
});

app.get('/api/chats/:id/messages', (req, res) => {
  db.all(`SELECT role, content FROM messages WHERE chat_id = ? ORDER BY id ASC`, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/chats/:id/messages', (req, res) => {
  const { role, content } = req.body;
  db.run(`INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)`, [req.params.id, role, content], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ id: this.lastID });
  });
});

app.listen(3000, () => console.log('Selah Server running on http://localhost:3000'));