#!/bin/sh
set -e

echo "▶ Ejecutando migraciones de base de datos..."
node_modules/.bin/prisma migrate deploy
echo "✓ Migraciones completadas"

exec "$@"
