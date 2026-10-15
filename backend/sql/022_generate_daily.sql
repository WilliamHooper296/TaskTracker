INSERT INTO daily (template_id, checked, created_at) 
(SELECT template_id, FALSE, CURRENT_DATE FROM template) ON CONFLICT (template_id, created_at) DO NOTHING