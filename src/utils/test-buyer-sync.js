// Script to test buyer sync by directly adding a buyer to Supabase
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBuyerSync() {
  // Get the user ID from command line arguments
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('Please provide a user ID as a command line argument');
    process.exit(1);
  }

  console.log('Testing buyer sync for user:', userId);

  // Create a test buyer
  const testBuyer = {
    id: uuidv4(),
    user_id: userId,
    name: 'Test Buyer ' + new Date().toISOString(),
    email: 'test@example.com',
    phone: '1234567890',
    created_at: new Date().toISOString()
  };

  console.log('Created test buyer:', testBuyer);

  try {
    // First check if the buyers table exists
    console.log('Checking if buyers table exists...');
    const { error: tableCheckError } = await supabase
      .from('buyers')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.error('Error checking buyers table:', tableCheckError);
      console.error('The buyers table might not exist in Supabase');
      process.exit(1);
    }

    console.log('Buyers table exists, inserting test buyer...');

    // Insert the test buyer
    const { data, error } = await supabase
      .from('buyers')
      .insert(testBuyer)
      .select();

    if (error) {
      console.error('Error inserting test buyer:', error);
      
      // Try using the RPC function as a fallback
      console.log('Trying RPC function as fallback...');
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('insert_buyer', {
          buyer_id: testBuyer.id,
          buyer_user_id: testBuyer.user_id,
          buyer_name: testBuyer.name,
          buyer_email: testBuyer.email,
          buyer_phone: testBuyer.phone
        });

      if (rpcError) {
        console.error('RPC fallback also failed:', rpcError);
        process.exit(1);
      }

      console.log('RPC call successful:', rpcData);
    } else {
      console.log('Successfully inserted test buyer:', data);
    }

    // Verify the buyer was inserted
    console.log('Verifying buyer was inserted...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', testBuyer.id);

    if (verifyError) {
      console.error('Error verifying buyer insertion:', verifyError);
      process.exit(1);
    }

    console.log('Verification result:', verifyData);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the function
testBuyerSync()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
