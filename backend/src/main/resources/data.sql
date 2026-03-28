INSERT INTO projects (customer, name)
VALUES
   ('Accenture', 'Intern Utvikling'),
   ('Telenor', 'Systemintegrasjon'),
   ('DNB', 'Digital transformasjon')
ON CONFLICT DO NOTHING;

INSERT INTO work_items (external_id, title, project_id)
VALUES
    ('ACC-001', 'Frontend utvikling', 1),
    ('ACC-002', 'Backend utvikling', 1),
    ('ACC-003', 'Testing og QA', 1),
    ('TEL-001', 'API integrasjon', 2),
    ('TEL-002', 'Databasemigrering', 2),
    ('DNB-001', 'Sikkerhetsrevisjon', 3),
    ('DNB-002', 'UI design', 3),
    ('DNB-003', 'Dataanlyse', 3)
ON CONFLICT DO NOTHING;



INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Test User', 'test@test.com', '$2b$10$U2InSC6kOyeWfiEoFXVUdOguELZVoUtCZ4Ammch.6Kwz3dInqs6GG', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;


