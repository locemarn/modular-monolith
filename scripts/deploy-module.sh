#!/bin/bash

# Script to deploy individual modules to Kubernetes
set -e

MODULE=$1
ENVIRONMENT=${2:-development}

if [ -z "$MODULE" ]; then
    echo "Usage: $0 <module-name> [environment]"
    echo "Available modules: api-gateway, user-service"
    echo "Available environments: development, staging, production"
    exit 1
fi

if [ ! -d "apps/$MODULE/k8s" ]; then
    echo "Error: Kubernetes manifests not found for module '$MODULE'"
    exit 1
fi

echo "Deploying module: $MODULE to $ENVIRONMENT"

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f apps/$MODULE/k8s/

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/$MODULE

echo "✅ Module $MODULE deployed successfully to $ENVIRONMENT!"

# Show service information
echo ""
echo "Service information:"
kubectl get services -l app=$MODULE