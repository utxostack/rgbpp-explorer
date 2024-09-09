#!/bin/sh
set -e

# Run migrations and seed
./backend/scripts/migrate-and-seed.sh

# Then exec the container's main process (what's set as CMD in the Dockerfile)
exec "$@"
