CREATE TABLE template(
    template_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    contents TEXT,
    completion TIME NOT NULL
)