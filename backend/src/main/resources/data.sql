INSERT INTO projects (customer, name)
VALUES
    ('Bertel O. Steen', 'Vedlikehold'),
    ('Accenture', 'Inter Utvikling'),
    ('Accenture', 'Kundestøtte'),
    ('Telenor', 'Systemintegrasjon'),
    ('Telenor', 'Infrastruktur'),
    ('DNB', 'Digital transformasjon'),
    ('DNB', 'Sikkerhetsrevisjon'),
    ('DNB', 'Dataanalyse'),
    ('Equinor', 'Feltoperasjoner'),
    ('Bouvet', 'Webutiklving')
ON CONFLICT DO NOTHING;



INSERT INTO users (display_name, email, password_hash, role)
VALUES ('Test User', 'test@test.com', '$2b$10$U2InSC6kOyeWfiEoFXVUdOguELZVoUtCZ4Ammch.6Kwz3dInqs6GG', 'EMPLOYEE')
ON CONFLICT (email) DO NOTHING;


