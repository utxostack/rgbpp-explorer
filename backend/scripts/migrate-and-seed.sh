#!/bin/sh

set -e

cd /app/backend

if npx prisma migrate status | grep -q "Database schema is up to date"; then
    echo "No pending migrations. Skipping migration."
else
    echo "Pending migrations found. Running migration..."
    npx prisma migrate deploy
    npx prisma generate
    npx prisma db seed
fi

