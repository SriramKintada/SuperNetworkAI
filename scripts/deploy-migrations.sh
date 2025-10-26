#!/bin/bash

# ============================================================================
# SuperNetworkAI - Deploy Database Migrations
# Description: Execute all migrations in order
# Usage: bash scripts/deploy-migrations.sh
# ============================================================================

echo "🚀 SuperNetworkAI - Database Migration Deployment"
echo "=================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked to Supabase"
    echo "Run: supabase link --project-ref mpztkfmhgbbidrylngbw"
    echo ""
    read -p "Do you want to link now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        supabase link --project-ref mpztkfmhgbbidrylngbw
    else
        exit 1
    fi
fi

echo "📦 Deploying migrations..."
echo ""

# Execute migrations in order
echo "1️⃣  Executing 001_initial_schema.sql (8 core tables)..."
supabase db push supabase/migrations/001_initial_schema.sql

if [ $? -ne 0 ]; then
    echo "❌ Migration 001 failed"
    exit 1
fi
echo "✅ Migration 001 completed"
echo ""

echo "2️⃣  Executing 002_rls_policies.sql (RLS policies)..."
supabase db push supabase/migrations/002_rls_policies.sql

if [ $? -ne 0 ]; then
    echo "❌ Migration 002 failed"
    exit 1
fi
echo "✅ Migration 002 completed"
echo ""

echo "3️⃣  Executing 003_functions_triggers.sql (DB functions)..."
supabase db push supabase/migrations/003_functions_triggers.sql

if [ $? -ne 0 ]; then
    echo "❌ Migration 003 failed"
    exit 1
fi
echo "✅ Migration 003 completed"
echo ""

echo "🎉 All migrations deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify tables: supabase db tables"
echo "2. Test authentication: Visit /signup in your frontend"
echo "3. Check Supabase dashboard: https://mpztkfmhgbbidrylngbw.supabase.co"
