.PHONY: dev build test setup clean db-up db-down

# Development
dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

# Setup
setup:
	chmod +x scripts/setup-dev.sh
	./scripts/setup-dev.sh

# Database
db-up:
	docker compose -f docker/VisionPAE/docker-compose.yml up -d db redis minio mailpit

db-down:
	docker compose -f docker/VisionPAE/docker-compose.yml down

db-reset:
	docker compose -f docker/VisionPAE/docker-compose.yml down -v
	docker compose -f docker/VisionPAE/docker-compose.yml up -d db redis minio mailpit
	sleep 5
	pnpm db:push
	pnpm db:seed

db-studio:
	pnpm db:studio

# Docker
docker-up:
	docker compose -f docker/VisionPAE/docker-compose.yml up --build

docker-down:
	docker compose -f docker/VisionPAE/docker-compose.yml down

# Docker Production
docker-prod-build:
	docker compose -f docker/prod/docker-compose.yml build

docker-prod-up:
	docker compose -f docker/prod/docker-compose.yml up -d

# Clean
clean:
	pnpm clean
	docker compose -f docker/VisionPAE/docker-compose.yml down -v
