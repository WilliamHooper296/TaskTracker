CREATE TABLE goals(
    user_id INTEGER NOT NULL,
    goal_id SERIAL PRIMARY KEY,
    contents TEXT NOT NULL,
    checked BOOLEAN NOT NULL
)