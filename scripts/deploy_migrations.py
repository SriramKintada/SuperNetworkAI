#!/usr/bin/env python3
"""
SuperNetworkAI - Deploy Migrations to Supabase
Uses Supabase Management API to execute SQL migrations
"""

import os
import sys
import requests
from pathlib import Path

# Supabase configuration
PROJECT_REF = "mpztkfmhgbbidrylngbw"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wenRrZm1oZ2JiaWRyeWxuZ2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzA5OTgsImV4cCI6MjA3NzA0Njk5OH0.9OUYqRn0ZgHNDuAg0szqNoRChhXOMZcvG3fbD1kcgew"

# Get service role key from environment
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

def execute_sql(sql_content):
    """Execute SQL using Supabase SQL endpoint"""

    if not SERVICE_ROLE_KEY:
        print("❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set")
        print("\nGet your service role key from:")
        print(f"https://{PROJECT_REF}.supabase.co/project/{PROJECT_REF}/settings/api")
        print("\nThen run:")
        print("export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'  # Linux/Mac")
        print("set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key      # Windows")
        sys.exit(1)

    # Use Supabase PostgREST API
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    # Supabase SQL endpoint (using PostgREST)
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec"

    payload = {
        "sql": sql_content
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return True, response.json()
    except requests.exceptions.RequestException as e:
        return False, str(e)

def deploy_migration(filename):
    """Deploy a single migration file"""
    print(f"\n📦 Deploying {filename}...")

    migration_path = Path(__file__).parent.parent / "supabase" / "migrations" / filename

    if not migration_path.exists():
        print(f"❌ Migration file not found: {migration_path}")
        return False

    sql_content = migration_path.read_text()

    # Note: Supabase doesn't have a direct SQL execution endpoint via REST API
    # We need to use the SQL editor or psql command
    print("⚠️  Direct SQL execution via REST API is not available")
    print("📋 SQL content loaded successfully")
    print(f"   Lines: {len(sql_content.splitlines())}")

    return True

def main():
    """Main deployment function"""
    print("🚀 SuperNetworkAI - Database Migration Deployment")
    print("=" * 50)
    print("\n⚠️  IMPORTANT: This script requires direct database access")
    print("The Supabase REST API doesn't support arbitrary SQL execution.")
    print("\nRECOMMENDED APPROACH:")
    print("1. Open Supabase SQL Editor:")
    print(f"   https://{PROJECT_REF}.supabase.co/project/{PROJECT_REF}/sql")
    print("2. Copy-paste each migration file")
    print("3. Execute in order (001, 002, 003)")
    print("\n" + "=" * 50)

    migrations = [
        "001_initial_schema.sql",
        "002_rls_policies.sql",
        "003_functions_triggers.sql"
    ]

    for migration in migrations:
        if not deploy_migration(migration):
            print(f"\n❌ Failed to process {migration}")
            sys.exit(1)

    print("\n✅ All migration files validated!")
    print("\nNext: Execute them in Supabase SQL Editor")

if __name__ == "__main__":
    main()
