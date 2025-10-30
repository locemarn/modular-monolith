#!/bin/bash

set -e

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: $0 <module-name>"
    echo "Example: $0 api-gateway"
    exit 1
fi

echo "Deploying $MODULE_NAME..."

# Build the Docker image first
./scripts/build-module.sh $MODULE_NAME

# Here you would add your deployment logic
# For example, pushing to a registry and deploying to Kubernetes
echo "🚀 $MODULE_NAME ready for deployment"
echo "Note: Add your specific deployment commands here"