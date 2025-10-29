#!/bin/bash

# Script to install dependencies for individual modules
set -e

MODULE=$1

if [ -z "$MODULE" ]; then
    echo "Usage: $0 <module-name>"
    echo "Available modules: api-gateway, user-service, all"
    exit 1
fi

if [ "$MODULE" = "all" ]; then
    echo "Installing dependencies for all modules..."
    
    echo "📦 Installing root dependencies..."
    pnpm install
    
    echo "📦 Installing api-gateway dependencies..."
    cd apps/api-gateway && pnpm install && cd ../..
    
    echo "📦 Installing user-service dependencies..."
    cd apps/user-service && pnpm install && cd ../..
    
    echo "✅ All dependencies installed!"
    exit 0
fi

if [ ! -d "apps/$MODULE" ]; then
    echo "Error: Module 'apps/$MODULE' does not exist"
    exit 1
fi

echo "Installing dependencies for module: $MODULE"

# Install module-specific dependencies
echo "📦 Installing $MODULE dependencies..."
cd apps/$MODULE
pnpm install
cd ../..

echo "✅ Dependencies for $MODULE installed successfully!"