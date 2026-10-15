WITH new_template AS(
    INSERT INTO template (user_id, contents, completion) VALUES ($1, $2, $3)
    RETURNING template_id
)
INSERT INTO daily (template_id, checked, created_at) (SELECT template_id, FALSE, CURRENT_DATE FROM new_template)