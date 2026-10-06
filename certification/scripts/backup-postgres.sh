#!/usr/bin/env sh
set -eu
umask 077

: "${DATABASE_URL:?Set DATABASE_URL to the production or target database}"
backup_dir=${BACKUP_DIR:-./backups/postgres}
mkdir -p "$backup_dir"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
output="$backup_dir/centaur-lms-$timestamp.dump"
temporary="$output.partial"
trap 'rm -f "$temporary"' EXIT HUP INT TERM

pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$temporary"
pg_restore --list "$temporary" >/dev/null
mv "$temporary" "$output"
trap - EXIT HUP INT TERM
printf 'Verified PostgreSQL backup: %s\n' "$output"
