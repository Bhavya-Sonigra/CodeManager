const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test the connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('problems').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Error connecting to Supabase:', error.message);
  }
};

testConnection();

module.exports = supabase;
