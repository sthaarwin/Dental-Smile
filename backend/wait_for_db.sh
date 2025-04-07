#!/bin/sh

set -e

host="$POSTGRES_HOST"
port="$POSTGRES_PORT"

until nc -z $host $port; do
  echo "Waiting for database at $host:$port..."
  sleep 1
done

echo "Database is ready!"