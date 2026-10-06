#!/usr/bin/env sh
set -eu

: "${RESTORE_DATABASE_URL:?Set RESTORE_DATABASE_URL to a fresh, empty recovery database}"
: "${RESTORE_CONFIRM:?Set RESTORE_CONFIRM=I_CONFIRM_EMPTY_TARGET after checking the target database}"
[ "$RESTORE_CONFIRM" = "I_CONFIRM_EMPTY_TARGET" ] || { echo 'Confirmation value is incorrect.' >&2; exit 2; }
[ "$#" -eq 1 ] || { echo "Usage: RESTORE_DATABASE_URL=... RESTORE_CONFIRM=I_CONFIRM_EMPTY_TARGET $0 backup.dump" >&2; exit 2; }
backup_file=$1
[ -f "$backup_file" ] || { echo "Backup file not found: $backup_file" >&2; exit 2; }
pg_restore --list "$backup_file" >/dev/null

existing_objects=$(psql "$RESTORE_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c \
  "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')")
[ "$existing_objects" = "0" ] || {
  echo "Recovery target is not empty ($existing_objects application tables); refusing to restore." >&2
  exit 3
}

pg_restore --dbname="$RESTORE_DATABASE_URL" --exit-on-error --no-owner --no-privileges "$backup_file"
psql "$RESTORE_DATABASE_URL" -X -v ON_ERROR_STOP=1 -c \
  "SELECT 'users' AS table_name, count(*) FROM users UNION ALL SELECT 'courses', count(*) FROM courses UNION ALL SELECT 'certificates', count(*) FROM certificates"
printf 'Restore completed and core LMS tables were queried. Keep this recovery target isolated until reviewed.\n'
