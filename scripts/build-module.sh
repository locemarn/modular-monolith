#!/bin/bash

set -e

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: $0 <module-name>"
    echo "Example: $0 api-gateway"
    exit 1
fi

echo "Building Docker image for $MODULE_NAME..."

# Build the Docker image
docker build -f apps/$MODULE_NAME/Dockerfile -t $MODULE_NAME:latest .

echo "✅ Docker image built successfully: $MODULE_NAME:latest"