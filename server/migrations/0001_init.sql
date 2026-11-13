CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  PRIMARY KEY (role_id, permission)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  name TEXT NOT NULL,
  name_ar TEXT,
  student_id TEXT,
  avatar TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS member_ranks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unique_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  faculty TEXT,
  faculty_ar TEXT,
  rank_id INTEGER REFERENCES member_ranks(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (code, name, description, is_system) VALUES
  ('SUPER_ADMIN', 'Super Admin', 'Full platform access', true),
  ('EVENT_MANAGER', 'Event Manager', 'Manage events and attendance', true),
  ('MEMBER_MANAGER', 'Member Manager', 'Manage members and ranks', true),
  ('CONTENT_MANAGER', 'Content Manager', 'Manage CMS content', true),
  ('TEAM_LEAD', 'Team Lead', 'Lead team operations', true),
  ('MEMBER', 'Member', 'Standard member access', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, permission FROM roles
CROSS JOIN (VALUES
  ('members.manage'),
  ('roles.manage'),
  ('events.manage'),
  ('attendance.manage'),
  ('content.manage')
) AS perms(permission)
WHERE code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, permission FROM roles
CROSS JOIN (VALUES
  ('members.manage')
) AS perms(permission)
WHERE code = 'MEMBER_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission)
SELECT id, permission FROM roles
CROSS JOIN (VALUES
  ('events.manage'),
  ('attendance.manage')
) AS perms(permission)
WHERE code = 'TEAM_LEAD'
ON CONFLICT DO NOTHING;

INSERT INTO member_ranks (title, title_ar, sort_order) VALUES
  ('President', 'الرئيس', 1),
  ('Vice President', 'نائب الرئيس', 2),
  ('Team Lead', 'قائد الفريق', 3),
  ('Member', 'عضو', 4)
ON CONFLICT DO NOTHING;
