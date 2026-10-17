SELECT daily.checked, daily.created_at, template.contents FROM 
daily JOIN template ON daily.template_id = template.template_id
WHERE template.user_id = $1