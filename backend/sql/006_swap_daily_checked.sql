UPDATE daily SET checked = NOT checked WHERE daily_id = $1 AND EXISTS 
(SELECT 1 FROM template WHERE template.template_id = daily.template_id AND template.user_id = #2)