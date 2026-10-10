CREATE TABLE session(
    session_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    last_query TIMESTAMP NOT NULL,
    expirey TIMESTAMP NOT NULL
)