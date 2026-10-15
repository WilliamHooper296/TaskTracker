CREATE TABLE daily(
    template_id INTEGER NOT NULL REFERENCES template(template_id),
    daily_id SERIAL PRIMARY KEY,
    checked BOOLEAN NOT NULL,
    created_at DATE NOT NULL,
    UNIQUE(template_id, created_at)
)