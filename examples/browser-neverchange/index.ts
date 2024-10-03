import { NeverChangeDB } from 'neverchange';
import { createAuthor, deleteAuthor, getAuthor, listAuthors, updateAuthor, updateAuthorRating } from './src/db/query_sql';

const migrations = [
  {
    version: 1,
    up: async(db) => {
      await db.execute(`
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
      `);
    }
  }
]

const run = async () => {
  const dbName = "test-db";
  const db = new NeverChangeDB(dbName);
  db.addMigrations(migrations);
  await db.init();

  try {
    await db.query("SELECT 1");
    await createAuthor(db, {name: "John Doe", bio: "A mysterious author", profilePic: null, rating: 0, isActive: 1});
    await createAuthor(db, {name: "Mary Jane", bio: "A curious reader", profilePic: null, rating: 0, isActive: 1});

    const authors = await listAuthors(db);
    console.log({authors})
    const author = await getAuthor(db, {id: 1});
    console.log({author})

    const updatedAuthor = await updateAuthor(db, {id: 1, name: "John Doe", bio: "A mysterious author!"});
    console.log({updatedAuthor})

    const updatedAuthor2 = await updateAuthorRating(db, {id: 1, rating: 4.8});
    console.log({updatedAuthor2})

    await deleteAuthor(db, {id: 1});

    const authors2 = await listAuthors(db);
    console.log({authors2})

    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

run().catch(e => console.error(e));