UPDATE daily SET checked = not checked WHERE daily_id = $1 AND template_id = 
(SELECT template_id FROM template WHERE user_id = $2)