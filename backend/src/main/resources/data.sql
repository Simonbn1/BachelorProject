INSERT INTO projects (customer, name)
VALUES
   ('Accenture', 'Intern Utvikling'),
   ('Telenor', 'Systemintegrasjon'),
   ('DNB', 'Digital transformasjon')
ON CONFLICT (customer, name) DO NOTHING;

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
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO projects (customer, name)
VALUES (NULL, 'Sykdom');


INSERT INTO work_items (external_id, title, project_id)
SELECT 'SYK-001', 'Sykefravær', id FROM projects WHERE name = 'Sykdom'
ON CONFLICT (external_id) DO NOTHING;



INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Test User', 'test@test.com', '$2b$10$U2InSC6kOyeWfiEoFXVUdOguELZVoUtCZ4Ammch.6Kwz3dInqs6GG', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;


INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Admin', 'admin@admin.com', '$2b$10$U2InSC6kOyeWfiEoFXVUdOguELZVoUtCZ4Ammch.6Kwz3dInqs6GG', 'ADMIN')
ON CONFLICT (email) DO NOTHING;



