SELECT template.contents, daily.checked, daily.daily_id, template.completion, template.template_id FROM 

daily JOIN template ON daily.template_id = template.template_id

WHERE template.user_id = $1 AND created_at = CURRENT_DATE