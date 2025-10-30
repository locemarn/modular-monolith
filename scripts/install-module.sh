#!/bin/bash

set -e

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: $0 <module-name|all>"
    echo "Example: $0 api-gateway"
    echo "Example: $0 all"
    exit 1
fi

if [ "$MODULE_NAME" = "all" ]; then
    echo "Installing dependencies for all modules..."
    pnpm install
else
    echo "Installing dependencies for $MODULE_NAME..."
    cd apps/$MODULE_NAME && pnpm install
fi

echo "✅ Dependencies installed successfully"