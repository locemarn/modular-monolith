#!/bin/bash

# Script to build individual modules
set -e

MODULE=$1

if [ -z "$MODULE" ]; then
    echo "Usage: $0 <module-name>"
    echo "Available modules: api-gateway, user-service"
    exit 1
fi

if [ ! -d "apps/$MODULE" ]; then
    echo "Error: Module 'apps/$MODULE' does not exist"
    exit 1
fi

echo "Building module: $MODULE"

# Build the NestJS application from root (for shared dependencies)
echo "Building NestJS application..."
pnpm run build $MODULE

# Build Docker image (uses module-specific package.json)
echo "Building Docker image..."
docker build -f apps/$MODULE/Dockerfile -t $MODULE:latest .

echo "✅ Module $MODULE built successfully!"
echo "Docker image: $MODULE:latest"
echo ""
echo "To run the container:"
echo "docker run -p 3000:3000 $MODULE:latest  # for api-gateway"
echo "docker run -p 3001:3001 $MODULE:latest  # for user-service"