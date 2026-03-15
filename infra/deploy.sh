#!/bin/bash
# Stop execution if any command fails
set -e

echo "====================================="
echo "Starting Zero-Downtime Safe Deploy..."
echo "====================================="

# 1. Fetch latest changes without merging to avoid breaking production
echo "-> Fetching latest changes from master..."
git fetch origin master
git checkout FETCH_HEAD

# 2. Build backend image with new code
echo "-> Building new Docker images..."
cd infra/
docker compose build backend

# 3. Run Pytest against the new code in an isolated container
echo "-> Running Pytest..."
# If this fails, the script will exit and we won't merge/deploy!
docker compose run --rm backend pytest

# 4. If tests pass, we are safe to merge and deploy
echo "-> Tests passed! Merging changes to master..."
cd ..
git checkout master
git merge FETCH_HEAD

# 5. Apply database migrations
echo "-> Applying database migrations..."
cd infra/
docker compose run --rm backend python manage.py migrate

# 6. Restart ONLY changed services (zero-downtime for unchanged apps)
echo "-> Restarting changed containers..."
docker compose up -d

# 7. Clean up dangling images
docker image prune -f

echo "====================================="
echo "Deploy completed successfully! 🚀"
echo "====================================="
