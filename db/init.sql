-- Create application database and user
CREATE USER admin WITH PASSWORD 'admin';
ALTER USER admin WITH SUPERUSER;
CREATE DATABASE dental_db;
GRANT ALL PRIVILEGES ON DATABASE dental_db TO admin;
