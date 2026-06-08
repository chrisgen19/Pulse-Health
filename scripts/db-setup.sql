-- Pulse Health — Postgres setup
-- Creates the application role and database to match:
--   postgres://myuser:mypassword@localhost:5432/pulsehealth
-- Run as a superuser, e.g.:  sudo -u postgres psql -f scripts/db-setup.sql

-- Role (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'myuser') THEN
    CREATE ROLE myuser LOGIN PASSWORD 'mypassword';
  ELSE
    ALTER ROLE myuser LOGIN PASSWORD 'mypassword';
  END IF;
END
$$;

-- Database (CREATE DATABASE can't run inside a DO block / transaction)
SELECT 'CREATE DATABASE pulsehealth OWNER myuser'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'pulsehealth')
\gexec

GRANT ALL PRIVILEGES ON DATABASE pulsehealth TO myuser;
