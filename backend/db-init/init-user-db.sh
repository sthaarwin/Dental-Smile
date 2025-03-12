#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
            CREATE ROLE admin WITH LOGIN PASSWORD 'root';
            ALTER ROLE admin SET client_encoding TO 'utf8';
            ALTER ROLE admin SET default_transaction_isolation TO 'read committed';
            ALTER ROLE admin SET timezone TO 'UTC';
            GRANT ALL PRIVILEGES ON DATABASE dental_appointment TO admin;
        END IF;
    END
    \$\$;
EOSQL