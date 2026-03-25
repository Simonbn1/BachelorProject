INSERT INTO projects (customer, name)
VALUES ('Bertel O. Steen', 'Vedlikehold')
ON CONFLICT DO NOTHING;

INSERT INTO work_items (external_id, title, project_id)
VALUES ('INC-001', 'Vedlikehold', 1)
ON CONFLICT DO NOTHING;

INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Test User', 'test@test.com', '$2b$10$U2InSC6kOyeWfiEoFXVUdOguELZVoUtCZ4Ammch.6Kwz3dInqs6GG', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;


