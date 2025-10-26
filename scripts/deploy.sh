#!/bin/bash

# SuperNetworkAI - Complete Deployment Script
# This script deploys all Supabase migrations and Edge Functions

set -e # Exit on error

echo "🚀 SuperNetworkAI Deployment Script"
echo "===================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f .supabase/config.toml ]; then
    echo "❌ Supabase project not linked. Run:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase project linked"
echo ""

# Step 1: Push database migrations
echo "📦 Pushing database migrations..."
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations complete"
echo ""

# Step 2: Deploy Edge Functions
echo "🔧 Deploying Edge Functions..."

functions=(
    "get-profile"
    "update-profile"
    "generate-embedding"
    "search-profiles"
    "match-ranking"
    "connections"
    "communities"
    "messages"
)

for func in "${functions[@]}"; do
    echo "   Deploying $func..."
    supabase functions deploy "$func" --no-verify-jwt

    if [ $? -ne 0 ]; then
        echo "   ❌ Failed to deploy $func"
        exit 1
    fi

    echo "   ✅ $func deployed"
done

echo ""
echo "✅ All Edge Functions deployed"
echo ""

# Step 3: Set environment secrets (if not already set)
echo "🔐 Checking environment secrets..."
echo ""
echo "Make sure you've set these secrets:"
echo "   supabase secrets set OPENAI_API_KEY=your_key"
echo "   supabase secrets set ANTHROPIC_API_KEY=your_key"
echo ""
echo "Run: supabase secrets list"
echo ""

# Step 4: Generate embeddings for existing profiles (optional)
read -p "🤖 Generate embeddings for existing profiles? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Generating embeddings..."
    node scripts/generate-embeddings.js
fi

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with Supabase URL and keys"
echo "2. Test the application: npm run dev"
echo "3. Check Supabase logs: supabase functions logs"
echo ""
echo "🎉 SuperNetworkAI is ready!"
