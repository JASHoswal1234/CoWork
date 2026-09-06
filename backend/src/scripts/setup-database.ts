import { supabaseAdmin } from '../config/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase() {
  console.log('🔧 Setting up database schema...');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../../../.kiro/specs/backend-implementation/database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split into individual statements (rough split - PostGIS might have issues with complex statements)
    // For Supabase, it's better to execute via the dashboard SQL editor
    
    console.log('📋 Database schema loaded from:', schemaPath);
    console.log('⚠️  Please execute this schema manually in Supabase SQL Editor:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/cwmnedvufqogcxulriom/sql/new');
    console.log('   2. Copy the contents from: .kiro/specs/backend-implementation/database-schema.sql');
    console.log('   3. Paste and click "Run"');
    console.log('');
    console.log('💡 Alternatively, the schema is ready in your project files.');

    // Test connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('❌ Tables not created yet. Please run the schema in Supabase SQL Editor.');
      } else {
        console.error('❌ Error testing connection:', error.message);
      }
    } else {
      console.log('✅ Database tables exist and connection is working!');
    }

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
