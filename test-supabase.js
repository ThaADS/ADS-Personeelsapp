// Test Supabase connection
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url-here' || supabaseKey === 'your-supabase-anon-key-here') {
  console.error('❌ Supabase configuration missing or not configured');
  console.log('Please update .env.local with your actual Supabase credentials:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('todos').select('count', { count: 'exact' });
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Todos count:', data);
    
    // Try to fetch actual data
    const { data: todos, error: fetchError } = await supabase.from('todos').select('*').limit(5);
    
    if (fetchError) {
      console.error('❌ Failed to fetch todos:', fetchError.message);
    } else {
      console.log('✅ Fetched todos:', todos);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();