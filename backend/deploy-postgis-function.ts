/**
 * Deploy PostGIS function to Supabase
 * Run: npx tsx deploy-postgis-function.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployPostGISFunction() {
  console.log('📦 Deploying PostGIS function to Supabase...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'postgis-functions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Read postgis-functions.sql');
    console.log('🔧 Executing SQL...\n');

    // Execute the SQL using Supabase RPC
    // Note: Supabase doesn't have a direct SQL execution API, so we use the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      // If the exec_sql RPC doesn't exist, we need to provide manual instructions
      console.log('⚠️  Direct SQL execution not available via API\n');
      console.log('📋 MANUAL DEPLOYMENT REQUIRED:\n');
      console.log('1. Open Supabase Dashboard: ' + supabaseUrl.replace('//', '//app.').replace('.co', '.co/project/_/sql'));
      console.log('2. Navigate to: SQL Editor');
      console.log('3. Copy and paste the contents of: backend/postgis-functions.sql');
      console.log('4. Click "Run" to execute the function\n');
      console.log('✅ The SQL file has been updated and is ready to deploy\n');
      return;
    }

    const data = await response.json();
    console.log('✅ PostGIS function deployed successfully!\n');
    console.log('Function: find_nearby_workers');
    console.log('Status: Updated with correct VARCHAR types\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS:\n');
    console.log('1. Open Supabase Dashboard: ' + supabaseUrl.replace('//', '//app.').replace('.co', '.co/project/_/sql'));
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Copy and paste the contents of: backend/postgis-functions.sql');
    console.log('4. Click "Run" to execute the function\n');
    process.exit(1);
  }
}

deployPostGISFunction();
