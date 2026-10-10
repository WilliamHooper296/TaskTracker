CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    pass TEXT NOT NULL,
    email TEXT,
    phone_num TEXT
)