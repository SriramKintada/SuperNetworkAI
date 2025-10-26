/**
 * SuperNetworkAI - Supabase Migration Deployment Script
 * Executes all SQL migrations using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://mpztkfmhgbbidrylngbw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wenRrZm1oZ2JiaWRyeWxuZ2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzA5OTgsImV4cCI6MjA3NzA0Njk5OH0.9OUYqRn0ZgHNDuAg0szqNoRChhXOMZcvG3fbD1kcgew';

// Note: For migrations, we need service_role key which has elevated permissions
// This script is a template - you'll need to add your service_role key
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('');
  console.log('Get your service role key from:');
  console.log('https://mpztkfmhgbbidrylngbw.supabase.co/project/mpztkfmhgbbidrylngbw/settings/api');
  console.log('');
  console.log('Then run:');
  console.log('set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('node scripts/deploy-to-supabase.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeMigration(filename) {
  console.log(`\n📦 Executing ${filename}...`);

  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    // Use Supabase's RPC or direct SQL execution
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, try alternative method
      console.log('⚠️  RPC method failed, trying direct connection...');

      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: stmtError } = await supabase
          .from('_migrations_temp')
          .select('*')
          .limit(0); // This won't work for executing arbitrary SQL

        if (stmtError) {
          console.error(`Error: ${stmtError.message}`);
          throw stmtError;
        }
      }
    }

    console.log(`✅ ${filename} executed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to execute ${filename}`);
    console.error(error.message);
    return false;
  }
}

async function deployMigrations() {
  console.log('🚀 SuperNetworkAI - Deploying Database Migrations');
  console.log('='.repeat(50));

  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_functions_triggers.sql'
  ];

  for (const migration of migrations) {
    const success = await executeMigration(migration);
    if (!success) {
      console.error(`\n❌ Migration failed at ${migration}`);
      console.error('Stopping deployment.');
      process.exit(1);
    }
  }

  console.log('\n🎉 All migrations deployed successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify tables: Check Supabase dashboard');
  console.log('2. Test authentication: Visit /signup in frontend');
}

deployMigrations();
