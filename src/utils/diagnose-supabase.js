// Script to diagnose Supabase connection and table issues
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSupabase() {
  console.log('Starting Supabase diagnosis...');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test connection
    console.log('\nTesting connection to Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase.from('_diagnose_connection').select('*').limit(1).catch(() => ({ data: null, error: { message: 'Connection test failed' } }));
    
    if (connectionError) {
      console.log('Connection test result: FAILED');
      console.log('Error:', connectionError.message);
    } else {
      console.log('Connection test result: SUCCESS');
    }
    
    // Check auth
    console.log('\nChecking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('Auth check result: FAILED');
      console.log('Error:', authError.message);
    } else if (user) {
      console.log('Auth check result: SUCCESS');
      console.log('Authenticated as user:', user.id);
    } else {
      console.log('Auth check result: NOT AUTHENTICATED');
      console.log('No user is currently authenticated');
    }
    
    // List all tables
    console.log('\nListing available tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('list_tables').catch(() => ({ data: null, error: { message: 'Could not list tables' } }));
    
    if (tablesError) {
      console.log('Could not list tables');
      console.log('Error:', tablesError.message);
      
      // Try alternative method
      console.log('Trying alternative method to check specific tables...');
      
      const tablesToCheck = ['buyers', 'sellers', 'transactions', 'users'];
      for (const table of tablesToCheck) {
        try {
          const { error: tableCheckError } = await supabase.from(table).select('count').limit(1);
          if (tableCheckError && tableCheckError.message.includes('does not exist')) {
            console.log(`Table '${table}': DOES NOT EXIST`);
          } else if (tableCheckError) {
            console.log(`Table '${table}': ERROR - ${tableCheckError.message}`);
          } else {
            console.log(`Table '${table}': EXISTS`);
          }
        } catch (e) {
          console.log(`Table '${table}': ERROR - ${e.message}`);
        }
      }
    } else {
      console.log('Available tables:');
      if (tables && tables.length) {
        tables.forEach(table => {
          console.log(`- ${table}`);
        });
      } else {
        console.log('No tables found or no permission to list tables');
      }
    }
    
    // Check buyers table specifically
    console.log('\nChecking buyers table...');
    const { data: buyersData, error: buyersError } = await supabase.from('buyers').select('count').limit(1);
    
    if (buyersError && buyersError.message.includes('does not exist')) {
      console.log('Buyers table: DOES NOT EXIST');
    } else if (buyersError) {
      console.log('Buyers table check result: ERROR');
      console.log('Error:', buyersError.message);
    } else {
      console.log('Buyers table check result: SUCCESS');
      
      // Count buyers
      const { count, error: countError } = await supabase.from('buyers').select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log('Could not count buyers');
        console.log('Error:', countError.message);
      } else {
        console.log(`Number of buyers in table: ${count}`);
      }
      
      // Get a sample buyer
      const { data: sampleBuyer, error: sampleError } = await supabase.from('buyers').select('*').limit(1);
      
      if (sampleError) {
        console.log('Could not get sample buyer');
        console.log('Error:', sampleError.message);
      } else if (sampleBuyer && sampleBuyer.length > 0) {
        console.log('Sample buyer:');
        console.log(JSON.stringify(sampleBuyer[0], null, 2));
      } else {
        console.log('No buyers found in the table');
      }
    }
    
    // Check RLS policies
    console.log('\nChecking Row Level Security policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('list_policies').catch(() => ({ data: null, error: { message: 'Could not list policies' } }));
    
    if (policiesError) {
      console.log('Could not check RLS policies');
      console.log('Error:', policiesError.message);
    } else if (policies && policies.length) {
      console.log('RLS policies found:');
      policies.forEach(policy => {
        console.log(`- ${policy.table_name}: ${policy.policy_name}`);
      });
    } else {
      console.log('No RLS policies found or no permission to list policies');
    }
    
    console.log('\nDiagnosis complete!');
  } catch (error) {
    console.error('Unexpected error during diagnosis:', error);
  }
}

// Run the function
diagnoseSupabase()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
