#!/bin/bash
# Seed script for demo content

set -e

echo "🌱 Seeding demo data..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
    echo "❌ Error: DATABASE_URL or DB_HOST environment variable must be set"
    exit 1
fi

# Build connection string if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL="postgres://${DB_USER:-adserver}:${DB_PASSWORD}@${DB_HOST:-localhost}:${DB_PORT:-5432}/${DB_NAME:-adserver}?sslmode=disable"
fi

# Run migrations
echo "📊 Running database migrations..."
migrate -path migrations -database "$DATABASE_URL" up

echo "✅ Demo data seeded successfully!"
