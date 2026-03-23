INSERT INTO projects (customer, name)
VALUES ('Bertel O. Steen', 'Vedlikehold')
ON CONFLICT DO NOTHING;

INSERT INTO work_items (external_id, title, project_id)
VALUES ('INC-001', 'Vedlikehold', 1)
ON CONFLICT DO NOTHING;

INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Test User', 'test@test.com', '$2a$10$IjClQwsk3HHMGMhV6sMwpuntC6Na.vsWZqj9ffOjijo5vXVIYhkZq', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;

