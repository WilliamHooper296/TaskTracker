CREATE TABLE session(
    session_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    last_query TIMESTAMPTZ NOT NULL,
    expirey TIMESTAMPTZ NOT NULL
)