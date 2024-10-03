CREATE TABLE authors (
  id         INTEGER PRIMARY KEY AUTOINCREMENT, -- INTEGER type
  name       TEXT      NOT NULL,                -- TEXT type
  bio        TEXT,                              -- TEXT type
  profile_pic BLOB,                             -- BLOB type (for binary data like image files)
  rating     REAL,                              -- REAL type (for ratings or scores as floating-point numbers)
  is_active  INTEGER DEFAULT 1,                 -- INTEGER type (using 0/1 to represent boolean values)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,    -- TEXT type (stored in date/time format)
  data_null  NULL                               -- NULL type (column to ensure values are NULL)
);
