CREATE TABLE daily(
    user_id INTEGER NOT NULL,
    daily_id SERIAL PRIMARY KEY,
    contents TEXT NOT NULL,
    checked BOOLEAN NOT NULL,
    completion TIME NOT NULL,
    created_at DATE NOT NULL
)