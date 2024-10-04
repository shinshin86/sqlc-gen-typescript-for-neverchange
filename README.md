# sqlc-gen-typescript-for-neverchange

![sqlc-gen-typescript-for-neverchange logo](./images/logo.jpeg)

Note: This repository is a fork of the [sqlc-gen-typescript](https://github.com/sqlc-dev/sqlc-gen-typescript) plugin.
It builds upon the foundation laid by the original project, while extending or modifying it to support [specific features or goals of your library]. Please refer to the original repository for detailed information on the base plugin, and check this repository for the new enhancements and changes.


> [!CAUTION]
> Here be dragons! This plugin is still in early access. Expect breaking changes, missing functionality, and sub-optimal output. Please report all issues and errors. Good luck!

## Usage

By adding the following to your `sqlc.yaml`, you can generate code using the `sqlc-gen-typescript-for-neverchange` plugin:

```yaml
version: '2'
plugins:
- name: ts
  wasm:
    url: https://github.com/shinshin86/sqlc-gen-typescript-for-neverchange/releases/download/v0.0.1/sqlc-gen-typescript-for-neverchange_0.0.1.wasm
    sha256: 224c6494cc2f8383ae79a2ca4f9d3c5ce0ebacbf6df161d98c414bdfaf1db82d
sql:
- schema: "schema.sql"
  queries: "query.sql"
  engine: "sqlite"
  codegen:
  - plugin: ts
    out: src/authors
    options:
      runtime: node
      driver: neverchange
```

## Supported engines and drivers

- SQLite Wasm via [neverchange](https://github.com/shinshin86/neverchange).

There is one version (`driver: neverchange`) that specifies types according to SQL, and another version (`driver: neverchange-anys`) where everything is treated as any type.

## Getting started

This tutorial assumes that the latest version of sqlc is
[installed](https://docs.sqlc.dev/en/latest/overview/install.html) and ready to use.

We'll generate TypeScript here, but other [language
plugins](https://docs.sqlc.dev/en/latest/reference/language-support.html) are
available. You'll need Bun (or Node.js) installed if you want to build and run a
program with the code sqlc generates, but sqlc itself has no dependencies.

### Setting up



### Schema and queries

sqlc needs to know your database schema and queries in order to generate code.
In the same directory, create a file named `schema.sql` with the following
content:

```sql
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
```

Next, create a `query.sql` file with the following five queries:

```sql
-- name: GetAuthor :one
SELECT * FROM authors
WHERE id = ? LIMIT 1;

-- name: ListAuthors :many
SELECT * FROM authors
ORDER BY name;

-- name: CreateAuthor :exec
INSERT INTO authors (
  name, bio, profile_pic, rating, is_active
) VALUES (
  ?, ?, ?, ?, ?
);

-- name: UpdateAuthor :one
UPDATE authors
  SET name = ?, 
      bio = ?
  WHERE id = ?
  RETURNING *;

-- name: UpdateAuthorRating :one
UPDATE authors
  SET rating = ?
  WHERE id = ?
  RETURNING *;

-- name: DeleteAuthor :exec
DELETE FROM authors
WHERE id = ?;
```

### Generating code

You are now ready to generate code. You shouldn't see any output when you run
the `generate` subcommand, unless something goes wrong:

```shell
$ sqlc generate
```

You should now have a `tutorial` subdirectory with three files containing Go
source code. These files comprise a Go package named `tutorial`:

```
├── package.json
├── query.sql
├── schema.sql
├── sqlc.yaml
└── db
    ├── query_sql.ts
```

### Using generated code

You can use your newly-generated code package from any TypeScript program.
Create a file named `index.ts` and add the following contents:

```ts
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
```

Before this code will run you'll need to install the `neverchange` package:

```shell
npm install neverchange
```

You should now have a working program using sqlc's generated TypeScript source
code, and hopefully can see how you'd use sqlc in your own real-world
applications.

## Development

If you want to build and test sqlc-gen-typescript locally, follow these steps:

1. Clone the repository and install dependencies:
   ```
   git clone https://github.com/shinshin86/sqlc-gen-typescript-for-neverchange.git
   cd sqlc-gen-typescript-for-neverchange
   npm install
   ```

2. Make your desired changes to the codebase. The main source files are located in the `src` directory.

3. If you've made changes that require updating dependencies, run:
   ```
   npm install
   ```

4. Build the WASM plugin:  
Check the `Makefile` for details.

   ```
   # Ensure you have Javy installed and available in your PATH
   make build
   ```

5. To test your local build, create a test project with a `sqlc.yaml` file containing:

   ```yaml
   version: '2'
   plugins:
   - name: ts
     wasm:
       url: file://{path_to_your_local_wasm_file}
       sha256: {sha256_of_your_wasm_file}
   sql:
   - schema: "schema.sql"
     queries: "query.sql"
     engine: "sqlite"
      codegen:
      - plugin: ts
        out: src/authors
        options:
          runtime: node
          driver: neverchange
   ```

   Replace the placeholders with appropriate values for your setup.

6. Run sqlc in your test project to generate TypeScript code using your local plugin build:
   ```
   sqlc generate
   ```

