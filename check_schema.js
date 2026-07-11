/*
 * Script to check the database schema and identify the root cause
 * of the "database schema is invalid or incompatible" error.
 * 
 * This script should be run in the browser console or in a Node.js environment
 * where you have access to the Supabase client.
 */

// Import the Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Checking Supabase configuration...");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables:");
  console.error("   VITE_SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING");
  console.error("   VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "SET" : "MISSING");
  console.error("   These need to be set in both local .env and Netlify environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseDatabaseSchema() {
  console.log("🔍 Starting database schema diagnosis...\n");

  // 1. Check if products table exists and has the right columns
  console.log("1. Checking products table schema...");
  try {
    const { data: productsColumns, error: productsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'products')
      .eq('table_schema', 'public');

    if (productsError) {
      console.error("   ❌ Error fetching products table schema:", productsError.message);
    } else {
      console.log("   ✓ Successfully fetched products table schema");
      console.log("   Current columns:", productsColumns.map(col => col.column_name));

      // Check for critical columns
      const requiredColumns = [
        'id', 'ref', 'name', 'category', 'subcategory', 'description', 
        'short_desc', 'image', 'pdf_url', 'availability', 'specs', 'tags', 'norm'
      ];
      
      const missingColumns = [];
      requiredColumns.forEach(col => {
        if (!productsColumns.some(c => c.column_name === col)) {
          missingColumns.push(col);
        }
      });

      if (missingColumns.length > 0) {
        console.error(`   ❌ Missing required columns: ${missingColumns.join(', ')}`);
        if (missingColumns.includes('pdf_url')) {
          console.error("   🚨 CRITICAL: pdf_url column is missing - this is likely the cause of the error!");
          console.log("      Migration 20250709000003_add_pdf_url_to_products.sql was not applied.");
        }
      } else {
        console.log("   ✓ All required columns present");
      }
    }
  } catch (error) {
    console.error("   ❌ Error checking products table:", error.message);
  }

  // 2. Check if profiles table exists (needed for admin authentication)
  console.log("\n2. Checking profiles table...");
  try {
    const { data: profilesColumns, error: profilesError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (profilesError) {
      console.error("   ❌ Profiles table not found:", profilesError.message);
      console.log("   This table should be created by migration 20250709000002");
    } else {
      console.log("   ✓ Profiles table exists with columns:", profilesColumns.map(col => col.column_name));
    }
  } catch (error) {
    console.error("   ❌ Error checking profiles table:", error.message);
  }

  // 3. Check if storage bucket exists
  console.log("\n3. Checking storage bucket 'product-images'...");
  try {
    const { data, error } = await supabase.storage.from('product-images').list('', { limit: 1 });
    
    if (error) {
      console.error("   ❌ Storage bucket 'product-images' not accessible:", error.message);
      console.log("   This bucket needs to be created manually in the Supabase dashboard.");
      console.log("   The bucket should be created by running the storage policies in migration 20250709000004");
    } else {
      console.log("   ✓ Storage bucket 'product-images' is accessible");
    }
  } catch (error) {
    console.error("   ❌ Error accessing storage bucket:", error.message);
  }

  // 4. Check RLS policies
  console.log("\n4. Checking Row Level Security policies...");
  try {
    const { data: policies, error: policiesError } = await supabase
      .rpc('pg_get_ruledef', { ruleoid: null })
      .select('*'); // This is a simplified check
    
    // More specific check for products policies
    const { data: productPolicies, error: productPoliciesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'products')
      .eq('schemaname', 'public');

    if (productPoliciesError) {
      console.error("   ❌ Error fetching RLS policies for products:", productPoliciesError.message);
    } else {
      console.log("   ✓ Found", productPolicies.length, "RLS policies for products table");
      console.log("   Policy names:", productPolicies.map(p => p.policyname));
      
      // Check for admin-only policies (from migration 20250709000004)
      const hasAdminPolicies = productPolicies.some(p => 
        p.policyname.includes('admin') || 
        p.policyname.includes('insert') || 
        p.policyname.includes('update') || 
        p.policyname.includes('delete')
      );
      
      if (!hasAdminPolicies) {
        console.log("   ⚠️  Admin-only RLS policies may be missing (migration 20250709000004)");
      } else {
        console.log("   ✓ Admin-only RLS policies appear to be in place");
      }
    }
  } catch (error) {
    console.error("   ❌ Error checking RLS policies:", error.message);
  }

  console.log("\n📋 DIAGNOSIS COMPLETE");
  console.log("\nThe most likely causes of 'database schema is invalid or incompatible':");
  console.log("1. ❗ Missing migration 20250709000003 (pdf_url column) - CHECK FIRST");
  console.log("2. ❗ Missing storage bucket 'product-images' - CREATE IN DASHBOARD");
  console.log("3. ❗ Outdated RLS policies (migration 20250709000004) - RUN MIGRATION");
  console.log("4. ❗ Wrong Supabase URL/key pointing to wrong project - VERIFY ENV VARS");
  
  console.log("\nTo fix:");
  console.log("- Apply missing migrations using: npx supabase db push");
  console.log("- Or manually run the SQL from the migration files in the SQL editor");
  console.log("- Create the 'product-images' storage bucket in the Supabase dashboard");
}

// Run diagnosis
diagnoseDatabaseSchema().catch(console.error);