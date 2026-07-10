#!/bin/sh
set -e

echo "🔄 Waiting for database..."
until pg_isready -h db -U pae -d pae_dev -q 2>/dev/null; do
  printf '.'
  sleep 2
done
echo ""
echo "✅ Database ready"

cd /app/apps/api

echo "🔄 Pushing schema to database..."
pnpm db:push --accept-data-loss 2>&1 | grep -v "already exists"
echo "✅ Schema pushed"

# Seed only if no tenants exist (idempotent)
TENANT_COUNT=$(PGPASSWORD=pae_dev_pass psql -h db -U pae -d pae_dev -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$TENANT_COUNT" = "0" ] || [ -z "$TENANT_COUNT" ]; then
  echo "🔄 Seeding database..."
  pnpm db:seed 2>&1
  echo "✅ Database seeded"
else
  echo "⏭️  Database already has $TENANT_COUNT tenant(s), skipping seed"
fi

echo "=========================================="
echo "🚀 VisionPAE API starting on port 3001..."
echo "=========================================="

exec pnpm start
