INSERT INTO projects (customer, name)
VALUES
    ('Bertel O. Steen', 'Vedlikehold'),
    ('Accenture', 'Intern Utvikling'),
    ('Accenture', 'Kundestøtte'),
    ('Telenor', 'Systemintegrasjon'),
    ('Telenor', 'Infrastruktur'),
    ('DNB', 'Digital transformasjon'),
    ('DNB', 'Sikkerhetsrevisjon'),
    ('DNB', 'Dataanalyse'),
    ('Equinor', 'Feltoperasjoner'),
    ('Bouvet', 'Webutiklving')
ON CONFLICT DO NOTHING;

INSERT INTO work_items (external_id, title, project_id)
VALUES
    ('Bertel O. Steen', 'Vedlikehold', 1),
    ('Accenture', 'Intern Utvikling', 2),
    ('Accenture', 'Kundestøtte', 3),
    ('Telenor', 'Systemintegrasjon', 4),
    ('Telenor', 'Infrastruktur', 5),
    ('DNB', 'Digital transformasjon', 6),
    ('DNB', 'Sikkerhetsrevisjon', 7),
    ('DNB', 'Dataanalyse', 8),
    ('Equinor', 'Feltoperasjoner', 9),
    ('Bouvet', 'Webutiklving', 10)
ON CONFLICT DO NOTHING;



INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Test User', 'test@test.com', '$2b$10$U2InSC6kOyeWfiEoFXVUdOguELZVoUtCZ4Ammch.6Kwz3dInqs6GG', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;


