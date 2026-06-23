#!/bin/sh
set -eu

if [ -z "${POSTGRES_DB_TEST:-}" ]; then
  exit 0
fi

db_exists="$(psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB_TEST}'" --username "$POSTGRES_USER" --dbname postgres)"

if [ "$db_exists" != "1" ]; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c "CREATE DATABASE \"$POSTGRES_DB_TEST\""
fi
