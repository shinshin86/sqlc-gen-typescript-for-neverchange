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
