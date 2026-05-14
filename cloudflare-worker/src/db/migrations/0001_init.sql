CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  stump_count INTEGER NOT NULL,
  service_package TEXT NOT NULL,
  estimated_total TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
