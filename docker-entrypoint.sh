#!/bin/bash
set -e

echo "=== VisionPAE - Iniciando todos los servicios ==="

# Aplicar migraciones si DATABASE_URL está configurada
if [ -n "$DATABASE_URL" ]; then
  echo ">>> Ejecutando migraciones..."
  cd /app/apps/api && npx prisma migrate deploy
  cd /app
fi

# Iniciar todos los servicios en background
echo ">>> Iniciando API (puerto 3001)..."
node /app/apps/api/dist/main.js &

echo ">>> Iniciando Web (puerto 3000)..."
node /app/apps/web/server.js &

echo ">>> Iniciando Worker..."
node /app/apps/worker/dist/main.js &

echo ">>> Iniciando Mobile Sync..."
node /app/apps/mobile-sync/dist/main.js &

echo "=== Todos los servicios iniciados ==="
echo "API: 3001 | Web: 3000 | Worker | MobileSync"

# Mantener el contenedor vivo
wait
