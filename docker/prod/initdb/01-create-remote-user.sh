#!/bin/bash
set -e

echo ">>> Creando usuario de acceso remoto ${DB_REMOTE_USER}..."

psql --username "$POSTGRES_USER" --dbname postgres -v ON_ERROR_STOP=1 <<-EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_REMOTE_USER}') THEN
    CREATE ROLE ${DB_REMOTE_USER} LOGIN SUPERUSER PASSWORD '${DB_REMOTE_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_REMOTE_USER} WITH LOGIN SUPERUSER PASSWORD '${DB_REMOTE_PASSWORD}';
  END IF;
END \$\$;
EOSQL

echo ">>> Usuario remoto ${DB_REMOTE_USER} configurado"
