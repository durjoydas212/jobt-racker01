const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(__dirname + "/../../database.db");

db.serialize(() => {
  // USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // DEFAULT ADMIN (SAFE INSERT)
  db.run(`
    INSERT OR IGNORE INTO users (name, phone, password, role)
    VALUES ('Admin', '1234567890', '1234', 'admin')
  `);

  // JOBS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_number TEXT,
      status TEXT,
      notes TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // IMAGES TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      image_url TEXT,
      tag TEXT
    )
  `);
});

status: "Started"; // user progress
admin_status: "Pending"; // admin decision
module.exports = db;
