#!/bin/bash

# Script to dynamically load all environment variables to EAS environment variables
# Usage: ./scripts/setup-eas-env-vars.sh [environment]
# Example: ./scripts/setup-eas-env-vars.sh production
# Default: preview

set -e

# Get environment from argument or default to preview
ENVIRONMENT=${1:-preview}

echo "🚀 Loading environment variables to EAS ($ENVIRONMENT environment)..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create one first."
    exit 1
fi

# Function to create EAS environment variable
create_env_var() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "⚠️  Warning: $name is empty, skipping..."
        return
    fi
    
    echo "📝 Creating environment variable: $name for $ENVIRONMENT"
    if eas env:create --name "$name" --value "$value" --visibility sensitive --environment "$ENVIRONMENT" --force --non-interactive; then
        echo "✅ $name created successfully"
    else
        echo "❌ Failed to create $name"
    fi
}

echo ""
echo "Reading environment variables from .env file..."

# Read .env file line by line and process each variable
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Check if line contains an assignment
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"
        
        # Remove leading/trailing whitespace from value
        var_value=$(echo "$var_value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Remove quotes if present
        if [[ "$var_value" =~ ^[\"\'](.*)[\"\']$ ]]; then
            var_value="${BASH_REMATCH[1]}"
        fi
        
        echo "Found variable: $var_name"
        create_env_var "$var_name" "$var_value"
    fi
done < .env

echo ""
echo "✅ All environment variables processing complete for $ENVIRONMENT!"
echo ""
echo "To verify environment variables were created, run:"
echo "eas env:list"
echo ""
echo "You can now create your build with:"
echo "eas build --platform all --profile $ENVIRONMENT"
echo "Android build only:"
echo "eas build --platform android --profile $ENVIRONMENT"
echo "iOS build only:"
echo "eas build --platform ios --profile $ENVIRONMENT"