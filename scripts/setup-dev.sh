#!/bin/bash
set -euo pipefail

echo "=== VisionPAE — Setup de Desarrollo ==="

# Verificar dependencias
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no encontrado"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm no encontrado. Instala con: npm i -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker no encontrado"; exit 1; }

echo "✅ Dependencias OK"

# Copiar env si no existe
if [ ! -f .env.development ]; then
  cp .env.example .env.development
  echo "✅ .env.development creado"
fi

# Instalar dependencias
echo "Instalando dependencias..."
pnpm install

# Generar Prisma client
echo "Generando Prisma client..."
pnpm db:generate

# Iniciar infraestructura Docker
echo "Iniciando servicios Docker (PostGIS, Redis, MinIO)..."
docker compose -f docker/VisionPAE/docker-compose.yml up -d db redis minio mailpit

echo "Esperando que PostgreSQL esté listo..."
until docker compose -f docker/VisionPAE/docker-compose.yml exec -T db pg_isready -U pae -d pae_dev 2>/dev/null; do
  sleep 2
done
echo "✅ PostgreSQL listo"

# Correr migraciones
echo "Ejecutando migraciones..."
pnpm db:push

# Sembrar datos
echo "Sembrando datos de prueba..."
pnpm db:seed

echo ""
echo "=== Setup completado ==="
echo "Para iniciar el desarrollo:"
echo "  pnpm dev"
echo ""
echo "Servicios:"
echo "  API:    http://localhost:3001"
echo "  Web:    http://localhost:3000"
echo "  MinIO:  http://localhost:9001 (admin/admin)"
echo "  Mail:   http://localhost:8025"
echo "  Redis:  localhost:6379"
